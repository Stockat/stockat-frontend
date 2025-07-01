import { Component, OnInit , OnDestroy} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuctionService } from '../../../core/services/auction.service'; 
import { BidService } from '../../../core/services/bid.service'; 
import { AuctionDetailsDto } from '../../../core/models/auction-models/auction-details-dto';
import { AuctionBidRequestCreateDto } from '../../../core/models/auction-models/bid-request-auction-dto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-auction-details',
  imports: [CommonModule,
     FormsModule,
     MessagesModule,
    MessageModule
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

  constructor(
    private route: ActivatedRoute,
    private auctionService: AuctionService,
    private bidService : BidService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.auctionService.getAuctionById(+id).subscribe(data => {
      this.auction = data;
      this.bidAmount = this.auction.currentBid + this.auction.incrementUnit;
      this.minBid = this.getMinBid();
      this.updateCountdown();
      this.startCountdown();
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

  pad(n: number): string {
    return n.toString().padStart(2, '0');
  }

  placeBid(): void {
    const bidRequest: AuctionBidRequestCreateDto = {
      auctionId: this.auction.id,
      bidderId: 'dd8eb1a2-0609-4368-9b0d-c8e55093646b', // Replace with actual user ID from auth
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