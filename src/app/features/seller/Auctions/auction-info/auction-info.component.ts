import { Component, OnInit } from '@angular/core';
import { AuctionService } from '../../../../../app/core/services/auction.service';
import { ActivatedRoute } from '@angular/router';
import { AuctionDetailsDto } from '../../../../core/models/auction-models/auction-details-dto';
import { AuctionBidRequestDto } from '../../../../../app/core/models/auction-models/bid-details-dto';
import { ProductService } from '../../../../../app/core/services/product.service';
import { Location } from '@angular/common';
import { UserService } from '../../../../core/services/user.service';
import { BidService } from '../../../../core/services/bid.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';     
import { RippleModule } from 'primeng/ripple';    
import { PaginatorModule } from 'primeng/paginator'; 
import { ChangeDetectorRef } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';

@Component({
  selector: 'app-auction-info',
  imports: [CommonModule,
    TableModule,
    ButtonModule,
    RippleModule,
    PaginatorModule,
  ],
  templateUrl: './auction-info.component.html',
  styleUrls: ['./auction-info.component.css']
})
export class AuctionInfoComponent implements OnInit {
  auction: AuctionDetailsDto | null = null;
  bids: AuctionBidRequestDto[] = [];
  pagedBids: AuctionBidRequestDto[] = [];
  loading = true;
  status: string = '';
  auctionId: number = 0;
  productImageUrl: string = 'assets/default-product.png';
  
  // Pagination
  bidPage = 0;
  bidPageSize = 5;
  totalBids = 0;

  constructor(
    private auctionService: AuctionService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private location: Location,
    private userService: UserService,
    private bidService: BidService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.auctionId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAuctionDetails();
    this.loadBids();
  }

  loadAuctionDetails() {
    this.auctionService.getAuctionById(this.auctionId).subscribe(auction => {
      this.auction = auction;
      this.calculateStatus();

      this.productService.getProductsDetails(auction.productId).subscribe(response => {
        const product = response.data;
        this.productImageUrl = product?.imagesArr?.[0] || 'assets/default-product.png';
        this.cdr.detectChanges();
      });
    });
  }

  loadBids() {
    this.loading = true;
    this.bidService.GetBidsForAuction(this.auctionId).subscribe({
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
  

  calculateStatus() {
    if (!this.auction) return;
    
    const now = new Date();
    const start = new Date(this.auction.startTime);
    const end = new Date(this.auction.endTime);

    if (now < start) this.status = 'Upcoming';
    else if (now >= start && now <= end) this.status = 'Active';
    else this.status = 'Closed';
  }

  getStatusClass(): string {
    switch(this.status) {
      case 'Upcoming': return 'bg-yellow-100 text-yellow-800';
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  editAuction()
  {
    console.log("Edit");
    //edit logic ...
  }

  goBack() {
    this.location.back();
  }
}
