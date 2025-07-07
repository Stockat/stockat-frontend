import { Component, OnInit, ViewChild } from '@angular/core';
import { AuctionService } from '../../../../core/services/auction.service';
import { ProductService } from '../../../../core/services/product.service';
import { AuctionDetailsDto } from '../../../../core/models/auction-models/auction-details-dto';
import { ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuctionEditDialogComponent } from '../auction-edit-dialog/auction-edit-dialog.component';
import { Table, TableModule } from 'primeng/table';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { ProductDetailsDto } from '../../../../core/models/product-models/ProductDetails';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';


@Component({
  selector: 'app-auctions-view',
  templateUrl: './auctions-view.component.html',
  imports: [
    TableModule,
    DynamicDialogModule,
    ConfirmDialogModule,
    CommonModule,
    DropdownModule,
    ReactiveFormsModule,
    InputTextModule,
    
  ],
  styleUrls: ['./auctions-view.component.css'],
  providers: [DialogService, ConfirmationService]
})
export class AuctionsViewComponent implements OnInit {
  @ViewChild('auctionTable') auctionTable!: Table;
  
  auctions: (AuctionDetailsDto & { status: string, productImage?: string })[] = [];
  loading = true;
  totalRecords = 0;
  rows = 10;
  first = 0;
  hoveredRow: number | null = null;
  productImages: { [auctionId: number]: string } = {};
  defaultImage = 'assets/default-product.png';
  

  statusOptions = [
    { label: 'All', value: 'all' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Active', value: 'active' },
    { label: 'Closed', value: 'closed' }
  ];
  
  statusFilter = new FormControl('all');
  searchControl = new FormControl('');
  ref: DynamicDialogRef | undefined;

  constructor(
    private auctionService: AuctionService,
    private productService: ProductService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAuctions();

    this.statusFilter.valueChanges.subscribe(() => {
      this.first = 0;
      this.loadAuctions();
    });

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.first = 0;
        this.loadAuctions();
      });
  }

  loadAuctions() {
    this.loading = true;
    const status: string = this.statusFilter.value || '';
    const search = this.searchControl.value || '';
    const page = Math.floor(this.first / this.rows) + 1;

    this.auctionService.getSellerAuctions(page, this.rows, status, search)
  .pipe(finalize(() => this.loading = false))
  .subscribe(response => {
    this.totalRecords = response.totalCount;

    this.auctions = response.data.map(auction => ({
      ...auction,
      status: this.calculateStatus(auction)
    }));

    this.auctions.forEach(auction => {
      this.productService.getProductsDetails(auction.productId).subscribe(response => {
        const product = response.data;
        const imageUrl = response.data?.imagesArr?.[0] || this.defaultImage;
        this.productImages[auction.id] = imageUrl;
      });
    });
  });
  }

  calculateStatus(auction: AuctionDetailsDto): string {
    const now = new Date();
    const start = new Date(auction.startTime);
    const end = new Date(auction.endTime);
  
    // Use precise comparison
    if (now.getTime() < start.getTime()) return 'Upcoming';
    if (now.getTime() >= start.getTime() && now.getTime() <= end.getTime()) return 'Active';
    return 'Closed';
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.loadAuctions();
  }

  editAuction(auction: any) {
    // Recalculate status using ORIGINAL dates
    console.log('Original auction:', auction);
  
  const now = new Date();
  const start = new Date(auction.startTime);
  const end = new Date(auction.endTime);
  console.log('Current time:', now);
  console.log('Start time:', start);
  console.log('End time:', end);
  
  let currentStatus = 'Upcoming';
  if (now >= start && now <= end) currentStatus = 'Active';
  if (now > end) currentStatus = 'Closed';
  console.log('Recalculated status:', currentStatus);
  
  const editableFields = this.getEditableFieldsByStatus(currentStatus);
  console.log('Editable fields:', editableFields);
  
    this.ref = this.dialogService.open(AuctionEditDialogComponent, {
      header: 'Edit Auction',
      width: '600px',
      data: {
        auction: {...auction},
        editableFields: editableFields
      }
    });
  
    this.ref.onClose.subscribe((updatePayload) => {
      if (updatePayload) {
        const { id, ...updateData } = updatePayload;
        this.auctionService.updateAuction(id, updateData).subscribe({
          next: () => this.loadAuctions(),
          error: (err) => console.error('Failed to update auction:', err)
        });
      }
    });
  }
  
  private getEditableFieldsByStatus(status: string): string[] {
    if (status === 'Upcoming') return ['name', 'description', 'startTime', 'endTime', 'startingPrice', 'quantity'];
    if (status === 'Active') return ['name', 'description', 'endTime'];
    return ['name', 'description'];
  }


  confirmDelete(auctionId: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this auction?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        console.log('Delete auction with ID:', auctionId);
        this.auctionService.deleteAuction(auctionId).subscribe(() => {
          this.loadAuctions();
        });
      }
    });
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'Upcoming': return 'bg-yellow-100 text-yellow-800';
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  onRowHover(index: number | null) {
    this.hoveredRow = index;
  }

  showAuctionDetails(auctionId: number) {
    this.router.navigate(['/seller/auctions', auctionId]);
  }
  
}