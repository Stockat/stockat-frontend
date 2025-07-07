// buyer-bids.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BidService } from '../../../core/services/bid.service';
import { UserService } from '../../../core/services/user.service';
import { AuctionBidRequestDto } from '../../../core/models/auction-models/bid-details-dto';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';
import { AuctionService } from '../../../core/services/auction.service';

@Component({
  selector: 'app-buyer-bids',
  standalone: true,
  imports: [
    TableModule,
    ProgressSpinnerModule,
    CommonModule,
    DatePipe,
    TruncatePipe
  ],
  templateUrl: './buyer-bids.component.html',
  styleUrls: ['./buyer-bids.component.css']
})
export class BuyerBidsComponent implements OnInit {
  loading = true;
  bids: AuctionBidRequestDto[] = [];
  activeBids: AuctionBidRequestDto[] = [];
  closedBids: AuctionBidRequestDto[] = [];
  userId: string = '';

  constructor(
    private bidService: BidService,
    private userService: UserService,
    private auctionService: AuctionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe({
      next: (response) => {
        const user = response.data;
        if (user?.id) {
          this.userId = user.id;
          this.loadBids();
        } else {
          console.error('User ID is missing in response');
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Failed to get user:', err);
        this.loading = false;
      }
    });
  }
  

  loadBids(): void {
    this.loading = true;
    
    this.bidService.GetBidsForUser(this.userId).subscribe({
      next: (bids) => {
        this.bids = bids;
  
        const auctionIds = [...new Set(this.bids.map((b: AuctionBidRequestDto) => b.auctionId))]; // Unique IDs
  
        const auctionRequests = auctionIds.map(id =>
          this.auctionService.getAuctionById(id).toPromise()
        );
  
        Promise.all(auctionRequests).then(auctionResults => {
          const auctionMap = new Map<number, any>();
          auctionResults.forEach(auction => {
            if (auction) auctionMap.set(auction.id, auction);
          });
  
          // Attach auction to each bid
          this.bids = this.bids.map(bid => ({
            ...bid,
            auction: auctionMap.get(bid.auctionId)
          }));
  
          this.categorizeBids();
          this.loading = false;
        });
      },
      error: (err) => {
        console.error('Failed to load bids:', err);
        this.loading = false;
      }
    });
  }
  
  
  

  categorizeBids(): void {
    const now = new Date();
  
    this.activeBids = this.bids
      .filter(bid => {
        const end = bid.auction?.endTime ? new Date(bid.auction.endTime) : null;
        return end && end > now;
      })
      .sort((a, b) => {
        const aStart = a.auction?.startTime ? new Date(a.auction.startTime).getTime() : 0;
        const bStart = b.auction?.startTime ? new Date(b.auction.startTime).getTime() : 0;
        return aStart - bStart;
      });
  
    this.closedBids = this.bids
      .filter(bid => {
        const end = bid.auction?.endTime ? new Date(bid.auction.endTime) : null;
        return end && end <= now;
      })
      .sort((a, b) => {
        const aEnd = a.auction?.endTime ? new Date(a.auction.endTime).getTime() : 0;
        const bEnd = b.auction?.endTime ? new Date(b.auction.endTime).getTime() : 0;
        return bEnd - aEnd;
      });
  }
  
  

  viewAuction(auctionId: string): void {
    this.router.navigate(['/seller/auctions', auctionId]);
  }
}