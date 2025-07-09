import { Component, OnInit , OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuctionService } from '../../../core/services/auction.service'; 
import { BidService } from '../../../core/services/bid.service'; 
import { AuctionDetailsDto } from '../../../core/models/auction-models/auction-details-dto';
import { AuctionBidRequestCreateDto } from '../../../core/models/auction-models/bid-request-auction-dto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, interval, map, Observable, of, Subscription, combineLatest, merge, filter } from 'rxjs';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { UserService } from '../../../core/services/user.service';
import { AuctionBidRequestDto } from '../../../core/models/auction-models/bid-details-dto';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ProductService } from '../../../core/services/product.service';
import { AuctionSignalRService } from '../../../core/services/auction-signalr.service';
import { AuthService } from '../../../core/services/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { NgZone } from '@angular/core';


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

   //a=bis updata
   isInputFocused = false;
private destroyed = false;

  @ViewChild('bidInput') bidInput!: ElementRef<HTMLInputElement>;

  constructor(
    private route: ActivatedRoute,
    private auctionService: AuctionService,
    private bidService : BidService,
    private userService:UserService,
    private productService: ProductService,
    private signalRService: AuctionSignalRService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef,
    private zone: NgZone,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
  this.loadUser();
  
  // 1. Simplify initialization
  this.signalRService.startConnection();
  
  // 2. Load auction after connection is established
  this.signalRService.connectionStarted$.subscribe(connected => {
    if (connected) {
      this.loadAuction(id);
    }
  });

  // 3. Unified SignalR handling
  this.setupSignalRSubscriptions();
  
  // 4. Tab visibility handling
  this.setupVisibilityHandler();
  }


  private setupSignalRSubscriptions() {
    // Combined handler for auction updates
    const auctionUpdate$ = merge(
      this.signalRService.bidPlaced$,
      this.signalRService.auctionUpdate$
    );
  
    auctionUpdate$.pipe(
      filter(data => data?.Auction?.id === this.auction?.id)
    ).subscribe(data => {
      this.zone.run(() => {
        this.handleAuctionUpdate(data);
      });
    });
  
    // Bid success handling
    this.signalRService.bidSuccess$.subscribe(bid => {
      this.zone.run(() => {
        if (bid) {
          this.messages = [
            { severity: 'success', summary: 'Success', detail: 'Bid placed successfully!' }
          ];
          // Don't reload auction - will be handled by auctionUpdate$
          this.cdRef.detectChanges();
        }
      });
    });
  
    // Error handling
    this.signalRService.error$.subscribe(msg => {
      this.zone.run(() => {
        if (msg) {
          this.messages = [
            { severity: 'error', summary: 'Error', detail: msg }
          ];
          this.cdRef.detectChanges();
        }
      });
    });
  }
  
  private handleAuctionUpdate(data: any) {
    // 1. Update auction with new reference
    this.auction = {...data.Auction};
    
    // 2. Update bids if available
    if (data.Bids) {
      this.bids = [...data.Bids];
      this.totalBids = this.bids.length;
      this.updatePagedBids();
    }
    
    // 3. Update bid values
    this.updateBidValues();
    
    // 4. Start countdown if needed
    if (!this.countdownSub || this.countdownSub.closed) {
      this.startCountdown();
    }
    
    // 5. Force UI update
    this.cdRef.detectChanges();
    console.log('Auction updated:', this.auction);
  }
  
  private updateBidValues() {
    const newMinBid = this.getMinBid();
    
    // Only update if:
    // 1. User hasn't manually changed the bid
    // 2. Or input is not focused
    if (this.bidAmount === this.minBid || !this.isInputFocused) {
      this.bidAmount = newMinBid;
    }
    
    this.minBid = newMinBid;
  }
  
  private setupVisibilityHandler() {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.auction?.id) {
        this.loadAuction(this.auction.id);
      }
    });
  }
  
  loadAuction(id: number): void {
    this.auctionService.getAuctionById(id).subscribe(data => {
      this.zone.run(() => {
        this.auction = {...data};
        this.minBid = this.getMinBid();
        
        // Only reset bid if input not focused
        if (!this.isInputFocused) {
          this.bidAmount = this.minBid;
        }
        
        this.startCountdown();
        this.loadProductImage();
        this.signalRService.joinAuction(this.auction.id);
        this.cdRef.detectChanges();
      });
    });
  }
  
  private loadProductImage() {
    if (!this.auction?.productId) return;
    
    this.productService.getProductsDetails(this.auction.productId).subscribe(response => {
      const product = response.data;
      this.productImageUrl = product?.imagesArr?.[0] || 'assets/default-product.png';
      this.cdRef.detectChanges();
    });
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

  // loadAuction(id: number): void {
  //   this.auctionService.getAuctionById(id).subscribe(data => {
  //     this.auction = data;
  //     this.minBid = this.auction.currentBid + this.auction.incrementUnit;
  //     this.bidAmount = this.minBid;
  //   });
  // }

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

    this.signalRService.placeBid(bidRequest);
  }

  // private updateBidValues() {
  //   this.minBid = this.getMinBid();
  //   this.bidAmount = this.minBid;
  //   // if (this.bidInput && this.bidInput.nativeElement) {
  //   //   this.bidInput.nativeElement.value = this.minBid.toString();
  //   // }
  // }

  ngOnDestroy(): void {
    if (this.countdownSub) {
      this.countdownSub.unsubscribe();
    }
    this.signalRService.leaveAuction(this.auction.id);
  }
}