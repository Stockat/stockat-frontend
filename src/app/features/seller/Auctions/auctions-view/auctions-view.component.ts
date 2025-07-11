import { Component, OnInit, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
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
import { AuctionSignalRService } from '../../../../core/services/auction-signalr.service';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';


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
    TooltipModule,
    ConfirmDialogModule,
    ToastModule,
  ],
  styleUrls: ['./auctions-view.component.css'],
  providers: [DialogService, ConfirmationService,MessageService]
})
export class AuctionsViewComponent implements OnInit {
  @ViewChild('auctionTable') auctionTable!: Table;
  
  auctions: (AuctionDetailsDto & { status: string, productImage?: string, productName?: string, stockId?: number })[] = [];
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
  allowedStatusValues = ['all', 'upcoming', 'active', 'closed'];

  constructor(
    private auctionService: AuctionService,
    private productService: ProductService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private signalRService: AuctionSignalRService,
    private cdRef: ChangeDetectorRef,
    private ngZone: NgZone
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
    // SignalR real-time updates
    this.signalRService.startConnection();
    this.signalRService.bidPlaced$.subscribe(data => {
      this.ngZone.run(() => {
        console.log('[SignalR] bidPlaced$ received:', data);
        if (data && data.Auction) {
          this.updateAuctionInList(data.Auction);
        }
        this.cdRef.detectChanges();
      });
    });
    this.signalRService.auctionUpdate$.subscribe(data => {
      this.ngZone.run(() => {
        console.log('[SignalR] auctionUpdate$ received:', data);
        if (data && data.Auction) {
          this.updateAuctionInList(data.Auction);
        }
        this.cdRef.detectChanges();
      });
    });
    this.signalRService.auctionCreated$.subscribe(() => {
      this.loadAuctions();
    });
    this.signalRService.auctionDeleted$.subscribe(() => {
      this.loadAuctions();
    });
  }

  loadAuctions() {
    this.loading = true;
    let status: string = this.statusFilter.value || '';
    const search = this.searchControl.value?.toLowerCase() || '';
    const page = Math.floor(this.first / this.rows) + 1;

    // If status is not allowed, clear auctions and return
    if (status && !this.allowedStatusValues.includes(status)) {
      this.auctions = [];
      this.totalRecords = 0;
      this.loading = false;
      return;
    }

    this.auctionService.getSellerAuctions(page, this.rows, status, '').pipe(finalize(() => this.loading = false)).subscribe(response => {
      let auctions = response.data.map(auction => ({
        ...auction,
        status: this.calculateStatus(auction),
        productName: '',
        stockId: auction.stockId
      }));

      // Fetch product names for each auction
      auctions.forEach((auction, idx) => {
        this.productService.getProductsDetails(auction.productId).subscribe(response => {
          const product = response.data;
          const imageUrl = response.data?.imagesArr?.[0] || this.defaultImage;
          this.productImages[auction.id] = imageUrl;
          auctions[idx].productName = product?.name || '';
        });
      });

      // Filter auctions by search (name, productName, stockId)
      if (search) {
        auctions = auctions.filter(a =>
          a.name?.toLowerCase().includes(search) ||
          a.productName?.toLowerCase().includes(search) ||
          (a.stockId && a.stockId.toString().includes(search))
        );
      }

      this.auctions = auctions;
      this.totalRecords = auctions.length;
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

  canEdit(auction: any): boolean {
    const now = new Date();
    const start = new Date(auction.startTime);
    const end = new Date(auction.endTime);
    
    // Can edit if auction is upcoming or active (not closed)
    return now <= end;
  }

  canDelete(auction: any): boolean {
    const now = new Date();
    const start = new Date(auction.startTime);
    const end = new Date(auction.endTime);
    
    // Can delete if auction is upcoming or closed
    return now < start || now > end;
  }

  confirmDelete(auctionId: number) {
    const auction = this.auctions.find(a => a.id === auctionId);
    if (!auction) return;

    const now = new Date();
    const start = new Date(auction.startTime);
    const end = new Date(auction.endTime);
    const isUpcoming = now < start;
    const isClosed = now > end;

    let message = 'Are you sure you want to delete this auction?';
    if (isUpcoming) {
      message = 'Are you sure you want to delete this upcoming auction? The stock will be returned to "For Sale" status.';
    } else if (isClosed) {
      message = 'Are you sure you want to delete this closed auction?';
    }

    this.confirmationService.confirm({
      message: message,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        console.log('Delete auction with ID:', auctionId);
        this.auctionService.deleteAuction(auctionId).subscribe({
          next: () => {
            this.loadAuctions();
            // Show success message
            console.log('Auction deleted successfully');
          },
          error: (err) => {
            console.error('Failed to delete auction:', err);
          }
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

  updateAuctionInList(updatedAuction: AuctionDetailsDto) {
    const idx = this.auctions.findIndex(a => a.id === updatedAuction.id);
    if (idx !== -1) {
      this.auctions[idx] = {
        ...this.auctions[idx],
        ...updatedAuction,
        status: this.calculateStatus(updatedAuction)
      };
      this.cdRef.detectChanges();
    }
  }
  
}