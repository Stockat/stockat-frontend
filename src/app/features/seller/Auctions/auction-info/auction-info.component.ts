import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { AuctionSignalRService } from '../../../../core/services/auction-signalr.service';

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
export class AuctionInfoComponent implements OnInit, OnDestroy {
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

  // Add status filter and soft delete logic
  statusFilter: string = 'All';

  get filteredAuctions() {
    if (!this.auction) return [];
    switch (this.statusFilter) {
      case 'Upcoming':
        return this.status === 'Upcoming' ? [this.auction] : [];
      case 'Active':
        return this.status === 'Active' ? [this.auction] : [];
      case 'Closed':
        return this.status === 'Closed' ? [this.auction] : [];
      default:
        return [this.auction];
    }
  }

  get canEdit(): boolean {
    return this.status !== 'Closed';
  }

  get canDelete(): boolean {
    return this.status === 'Upcoming' || this.status === 'Closed';
  }

  constructor(
    private auctionService: AuctionService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private location: Location,
    private userService: UserService,
    private bidService: BidService,
    private cdr: ChangeDetectorRef,
    private signalRService: AuctionSignalRService
  ) {}

  ngOnInit() {
    this.auctionId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAuctionDetails();
    this.loadBids();
    
    // SignalR real-time updates for seller
    this.signalRService.startConnection();
    this.signalRService.joinAuction(this.auctionId);

    this.signalRService.bidPlaced$.subscribe(data => {
      if (data && data.Auction && data.Auction.id === this.auctionId) {
        this.auction = data.Auction;
        this.calculateStatus();
        this.cdr.detectChanges();
        
        // Add the new bid to the bids array if it exists
        if (data.Bid) {
          const newBid = {
            ...data.Bid,
            bidderName: 'New Bidder' // Will be updated when we fetch user details
          };
          this.bids.unshift(newBid);
          this.totalBids = this.bids.length;
          this.updatePagedBids();
        } else {
          // Fallback: reload all bids
          this.loadBids();
        }
      }
    });

    this.signalRService.auctionUpdate$.subscribe(data => {
      if (data && data.Auction && data.Auction.id === this.auctionId) {
        this.auction = data.Auction;
        this.calculateStatus();
        this.cdr.detectChanges();
        
        if (data.Bids) {
          this.bids = data.Bids;
          this.totalBids = this.bids.length;
          this.updatePagedBids();
        }
      }
    });
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

  editAuction() {
    if (!this.canEdit) return;
    console.log("Edit");
    //edit logic ...
  }

  deleteAuction() {
    if (!this.auction) return;
    if (this.status === 'Upcoming' || this.status === 'Closed') {
      this.auctionService.deleteAuction(this.auction.id).subscribe({
        next: () => {
          // For upcoming, backend will update stock to ForSale
          // For closed, just soft delete
          this.goBack();
        },
        error: (err) => {
          alert('Failed to delete auction: ' + err?.error?.message || err.message);
        }
      });
    }
  }

  goBack() {
    this.location.back();
  }

  ngOnDestroy() {
    if (this.auctionId) {
      this.signalRService.leaveAuction(this.auctionId);
    }
  }
}
