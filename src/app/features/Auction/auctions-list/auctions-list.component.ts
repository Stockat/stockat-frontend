import { Component, OnInit } from '@angular/core';
import { AuctionService } from '../../../core/services/auction.service';
import { AuctionDetailsDto } from '../../../core/models/auction-models/auction-details-dto';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-auctions-list',
  imports: [RouterLink,
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    ToggleButtonModule,
    FormsModule,
    PaginatorModule,
    DialogModule
  ],
  templateUrl: './auctions-list.component.html',
  styleUrl: './auctions-list.component.css'
})
export class AuctionsListComponent implements OnInit {
  currentPage = 0;
  pageSize = 6;
  pagedAuctions: AuctionDetailsDto[] = [];
  totalRecords = 0;
  auctions: AuctionDetailsDto[] = [];
  filteredAuctions: AuctionDetailsDto[] = [];
  selectedAuction: AuctionDetailsDto | null = null;
  winnerName: string = '';
  showDialog = false;
  
  searchText: string = '';
  filters = {
    hasBid: false,
    isClosed: false,
    activeOnly: false
  };

  constructor(private auctionService: AuctionService,
    private userService:UserService
  ) {}

  ngOnInit(): void {
    this.loadAuctions();
  }

  loadAuctions(): void {
    this.auctionService.getAllAuctions().subscribe(data => {
      this.auctions = data;
      this.filteredAuctions = [...data];
      console.log(this.auctions);
      this.applyFilters();
    });
  }

  applyFilters(): void {
    const now = new Date();
    
    const filtered = this.auctions.filter(auction => {
      const matchesSearch = auction.name.toLowerCase().includes(this.searchText.toLowerCase());
  
      const hasBidMatch = this.filters.hasBid 
        ? auction.currentBid > auction.startingPrice 
        : true;
  
      const isClosedMatch = this.filters.isClosed 
        ? this.isAuctionClosed(auction)
        : true;
  
      const activeOnlyMatch = this.filters.activeOnly
        ? new Date(auction.startTime) <= now && new Date(auction.endTime) >= now
        : true;
  
      return matchesSearch && hasBidMatch && isClosedMatch && activeOnlyMatch;
    });
  
    this.filteredAuctions = filtered;
    this.totalRecords = filtered.length;
    this.updatePagedAuctions();
  }

  updatePagedAuctions(): void {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.pagedAuctions = this.filteredAuctions.slice(start, end);
  }

  onPageChange(event: any): void {
    this.currentPage = event.page;
    this.updatePagedAuctions();
  }
  

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.filters = {
      hasBid: false,
      isClosed: false,
      activeOnly: false
    };
    this.searchText = '';
    this.applyFilters();
  }

  getTimeRemaining(endTime: string): string {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    
    return `${days > 0 ? days + 'd ' : ''}${hours}h ${minutes}m`;
  }
  now = new Date();
  isAuctionClosed(auction: AuctionDetailsDto): boolean {
    return new Date(auction.endTime) < this.now;
  }

  //now = new Date();

  viewResults(auction: AuctionDetailsDto): void {
    this.selectedAuction = auction;
    this.showDialog = true;
    console.log(auction.buyerId);
    if (auction.buyerId) {
      this.userService.getUserById(auction.buyerId).subscribe(user => {
        console.log(user);
        this.winnerName = `${user.data.firstName} ${user.data.lastName}`;
      });
    } else {
      this.winnerName = 'No winner';
    }
  }
  

  getAuctionStatus(auction: AuctionDetailsDto): 'upcoming' | 'active' | 'closed' {
    const now = new Date();
    const start = new Date(auction.startTime);
    const end = new Date(auction.endTime);
  
    if (now < start) return 'upcoming';
    if (now >= start && now < end) return 'active';
    return 'closed';
  }
  
  // Optional helpers if you prefer booleans
  isUpcoming(auction: AuctionDetailsDto): boolean {
    return this.getAuctionStatus(auction) === 'upcoming';
  }
  
  isActive(auction: AuctionDetailsDto): boolean {
    return this.getAuctionStatus(auction) === 'active';
  }
  
  isClosed(auction: AuctionDetailsDto): boolean {
    return this.getAuctionStatus(auction) === 'closed';
  }

}