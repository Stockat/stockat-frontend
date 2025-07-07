import { Component, Input, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { AuctionDetailsDto } from '../../../../core/models/auction-models/auction-details-dto';
import { CommonModule } from '@angular/common';
import { AuctionService } from '../../../../core/services/auction.service';
import { BidService } from '../../../../core/services/bid.service';

@Component({
  selector: 'app-auction-analysis',
  standalone: true,
  imports: [ChartModule, CommonModule],
  templateUrl: './auction-analysis.component.html',
  styleUrl: './auction-analysis.component.css'
})
export class AuctionAnalysisComponent implements OnChanges, AfterViewInit {
  auctions: AuctionDetailsDto[] = [];

  constructor(
    private auctionService: AuctionService,
    private bidService: BidService
  ) {}

  ngAfterViewInit(): void {
    // Fetch auctions and update charts after view is initialized
    this.auctionService.getAllAuctions().subscribe({
      next: (data) => {
        this.auctions = data;
        this.updateStatusChart();
        this.updatePriceChart();
      },
      error: (err) => console.error('Error fetching auctions:', err)
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['auctions']) {
      this.updateStatusChart();
      this.updatePriceChart();
    }
  }

  private now = new Date();

  private isAuctionClosed(auction: AuctionDetailsDto): boolean {
    return new Date(auction.endTime) < this.now;
  }

  private isAuctionActive(auction: AuctionDetailsDto): boolean {
    const now = this.now;
    const start = new Date(auction.startTime);
    const end = new Date(auction.endTime);
    return now >= start && now <= end;
  }

  // Summary
  get totalAuctions(): number {
    return this.auctions.length;
  }

  get activeAuctions(): number {
    return this.auctions.filter(a => this.isAuctionActive(a)).length;
  }

  get completedAuctions(): number {
    return this.auctions.filter(a => this.isAuctionClosed(a)).length;
  }

  get totalRevenue(): number {
    return this.auctions
      .filter(a => this.isAuctionClosed(a) && a.buyerId)
      .reduce((sum, auction) => sum + (auction.currentBid * auction.quantity), 0);
  }

  get averageBidIncrease(): number {
    const validAuctions = this.auctions.filter(
      a => this.isAuctionClosed(a) && a.currentBid > a.startingPrice
    );
    if (validAuctions.length === 0) return 0;
    return validAuctions.reduce((sum, a) =>
      sum + ((a.currentBid - a.startingPrice) / a.startingPrice * 100), 0
    ) / validAuctions.length;
  }

  // Chart Data
  statusChartData = {
    labels: ['Active', 'Completed', 'No Bids'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#6366F1', '#10B981', '#EF4444'],
      hoverBackgroundColor: ['#8183f3', '#34d399', '#f87171']
    }]
  };

  statusChartOptions = {
    plugins: {
      legend: { position: 'bottom' }
    },
    cutout: '60%'
  };

  priceChartData: any;
  priceChartOptions = {
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  private updateStatusChart(): void {
    const active = this.activeAuctions;
    const completed = this.completedAuctions;
    const noBids = this.auctions.filter(
      a => this.isAuctionClosed(a) && !a.buyerId
    ).length;

    this.statusChartData = {
      ...this.statusChartData,
      datasets: [{
        ...this.statusChartData.datasets[0],
        data: [active, completed, noBids]
      }]
    };
  }

  private updatePriceChart(): void {
    const priceData = this.auctions
      .filter(a => this.isAuctionClosed(a))
      .map(a => ({
        name: a.name,
        start: a.startingPrice,
        final: a.currentBid,
        increase: a.currentBid - a.startingPrice
      }))
      .sort((a, b) => b.increase - a.increase)
      .slice(0, 5);

    this.priceChartData = {
      labels: priceData.map(d => d.name),
      datasets: [
        {
          label: 'Starting Price',
          backgroundColor: '#6366F1',
          data: priceData.map(d => d.start)
        },
        {
          label: 'Final Price',
          backgroundColor: '#10B981',
          data: priceData.map(d => d.final)
        }
      ]
    };
  }
}
