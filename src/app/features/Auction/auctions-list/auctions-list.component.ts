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

@Component({
  selector: 'app-auctions-list',
  imports: [RouterLink,
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    ToggleButtonModule,
    FormsModule
  ],
  templateUrl: './auctions-list.component.html',
  styleUrl: './auctions-list.component.css'
})
export class AuctionsListComponent implements OnInit {
  auctions: AuctionDetailsDto[] = [];
  filteredAuctions: AuctionDetailsDto[] = [];
  searchText: string = '';
  filters = {
    hasBid: false,
    isClosed: false,
    activeOnly: false
  };

  constructor(private auctionService: AuctionService) {}

  ngOnInit(): void {
    this.loadAuctions();
  }

  loadAuctions(): void {
    this.auctionService.getAllAuctions().subscribe(data => {
      this.auctions = data;
      this.filteredAuctions = [...data];
      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.filteredAuctions = this.auctions.filter(auction => {
      const matchesSearch = auction.name.toLowerCase().includes(this.searchText.toLowerCase());
      
      // Handle hasBid filter
      const hasBidMatch = this.filters.hasBid 
        ? auction.currentBid > auction.startingPrice 
        : true;
      
      // Handle isClosed filter
      const isClosedMatch = this.filters.isClosed 
        ? auction.isClosed 
        : true;
      
      // Handle activeOnly filter
      const activeOnlyMatch = this.filters.activeOnly 
        ? !auction.isClosed 
        : true;
      
      // Combine filters with logical AND
      return matchesSearch && hasBidMatch && isClosedMatch && activeOnlyMatch;
    });
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

  isAuctionClosed(auction: AuctionDetailsDto): boolean {
    return auction.isClosed;
  }
}