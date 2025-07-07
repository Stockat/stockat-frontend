import { Component, OnInit , OnDestroy} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuctionService } from '../../../core/services/auction.service'; 
import { BidService } from '../../../core/services/bid.service'; 
import { AuctionDetailsDto } from '../../../core/models/auction-models/auction-details-dto';
import { AuctionBidRequestCreateDto } from '../../../core/models/auction-models/bid-request-auction-dto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, interval, map, Observable, of, Subscription } from 'rxjs';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { UserService } from '../../../core/services/user.service';
import { AuctionBidRequestDto } from '../../../core/models/auction-models/bid-details-dto';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ProductService } from '../../../core/services/product.service';


@Component({
  selector: 'app-auction-details',
  imports: [CommonModule,
     FormsModule,
     MessagesModule,
    MessageModule,
    PaginatorModule,
    DialogModule,
    TableModule
  ],
  templateUrl: './auction-details.component.html',
  styleUrls: ['./auction-details.component.css']
})
export class AuctionDetailsComponent implements OnInit, OnDestroy {
  auction!: AuctionDetailsDto;
  minBid: number = 0;
  bidAmount: number = 0;
  timeLeft: string = '';
  private countdownSub!: Subscription;
  messages: { severity: string; summary: string; detail: string }[] = [];
  userId: string = '';
  productImageUrl='https://i.pinimg.com/736x/9e/18/fa/9e18fae10788270d8153de5850e0526f.jpg';

  bids: AuctionBidRequestDto[] = [];
  pagedBids: AuctionBidRequestDto[] = [];
  loading = true;

   // Pagination
   bidPage = 0;
   bidPageSize = 5;
   totalBids = 0;

  constructor(
    private route: ActivatedRoute,
    private auctionService: AuctionService,
    private bidService : BidService,
    private userService:UserService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadUser();
    this.auctionService.getAuctionById(+id).subscribe(data => {
      this.auction = data;
    
      // Set bid values
      this.bidAmount = this.auction.currentBid + this.auction.incrementUnit;
      this.minBid = this.getMinBid();
    
      // Start countdown
      this.updateCountdown();
      this.startCountdown();
    
      // Load related product image
      this.productService.getProductsDetails(this.auction.productId).subscribe(response => {
        const product = response.data;
        this.productImageUrl = product?.imagesArr?.[0] || 'assets/default-product.png';
      });
    });
    
    this.loadBids();
  }

  loadUser(){
    this.userService.getCurrentUser().subscribe({
      next: (response) => {
        this.userId = response.data?.id || '';
      },
      error: (err) => {
        console.error('Failed to get user:', err);
      }
    });
  }

  startCountdown(): void {
    this.countdownSub = interval(1000).subscribe(() => this.updateCountdown());
  }

  updateCountdown(): void {
    if (!this.auction?.endTime) {
      this.timeLeft = 'N/A';
      return;
    }

    const now = new Date().getTime();
    const end = new Date(this.auction.endTime).getTime();
    const diff = end - now;

    if (diff <= 0) {
      this.timeLeft = 'Auction Ended';
      if (this.countdownSub) {
        this.countdownSub.unsubscribe();
      }
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    this.timeLeft = `${this.pad(days)}d : ${this.pad(hours)}h : ${this.pad(minutes)}m : ${this.pad(seconds)}s`;
  }

  getMinBid(): number {
    return (this.auction?.currentBid || 0) + (this.auction?.incrementUnit || 0);
  }

  loadAuction(id: number): void {
    this.auctionService.getAuctionById(id).subscribe(data => {
      this.auction = data;
      this.minBid = this.auction.currentBid + this.auction.incrementUnit;
      this.bidAmount = this.minBid;
    });
  }

  loadBids() {
    this.loading = true;
    this.bidService.GetBidsForAuction(this.route.snapshot.params['id']).subscribe({
      next: (bids) => {
        if (!bids || bids.length === 0) {
          this.bids = [];
          this.totalBids = 0;
          this.updatePagedBids();
          this.loading = false;
          return;
        }
  
        const fetchUsers: Observable<AuctionBidRequestDto>[] = bids.map((bid: AuctionBidRequestDto) =>
          this.userService.getUserById(bid.bidderId).pipe(
            map(userResponse => {
              const user = userResponse?.data ?? userResponse;
              return {
                ...bid,
                bidderName: `${user.firstName} ${user.lastName}`
              };
            }),
            catchError(() => of({
              ...bid,
              bidderName: 'Unknown Bidder'
            }))
          )
        );
  
        forkJoin(fetchUsers).subscribe((enrichedBids: AuctionBidRequestDto[]) => {
          setTimeout(() => {
            this.bids = enrichedBids;
            this.totalBids = enrichedBids.length;
            this.updatePagedBids();
            this.loading = false;
          });
        });
      },
      error: (err) => {
        console.error('Error fetching bids:', err);
        this.loading = false;
      }
    });
  }
  

  updatePagedBids() {
    const start = this.bidPage * this.bidPageSize;
    const end = start + this.bidPageSize;
    this.pagedBids = this.bids.slice(start, end);
  }
  

  onBidPageChange(event: any) {
    this.bidPageSize = event.rows;
    this.bidPage = Math.floor(event.first / event.rows);
    this.updatePagedBids();
  }

  pad(n: number): string {
    return n.toString().padStart(2, '0');
  }

  placeBid(): void {
    const bidRequest: AuctionBidRequestCreateDto = {
      auctionId: this.auction.id,
      bidderId: this.userId, 
      bidAmount: this.bidAmount
    };

    const minBid = this.getMinBid();
    if (this.bidAmount < this.minBid) {
      this.messages = [
        { severity: 'warn', summary: 'warn', detail: `Bid must be at least $${this.minBid}` }
      ];
      return;
    }

    this.bidService.submitBid(bidRequest).subscribe({
      next: () => {
        this.messages = [
          { severity: 'success', summary: 'Success', detail: 'Bid placed successfully!' }
        ];
        this.loadAuction(this.auction.id); // Refresh auction details
      },
      error: (err) => {
        console.error(err);
        this.messages = [
          { severity: 'error', summary: 'Error', detail: 'Failed to place bid.' }
        ];
      }
    });
  }

  ngOnDestroy(): void {
    if (this.countdownSub) {
      this.countdownSub.unsubscribe();
    }
  }
}