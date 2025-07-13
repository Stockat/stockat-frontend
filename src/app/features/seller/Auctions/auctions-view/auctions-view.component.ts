import { Component, OnInit, ViewChild, ChangeDetectorRef, NgZone, OnDestroy } from '@angular/core';
import { AuctionService } from '../../../../core/services/auction.service';
import { ProductService } from '../../../../core/services/product.service';
import { AuctionDetailsDto } from '../../../../core/models/auction-models/auction-details-dto';
import { ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuctionEditDialogComponent } from '../auction-edit-dialog/auction-edit-dialog.component';
import { Table, TableModule } from 'primeng/table';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
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
import { UserService } from '../../../../core/services/user.service';
import { UserReadDto } from '../../../../core/models/user-models/user-read.dto';
import { PagedResponse } from '../../../../core/models/auction-models/paged-response';
import { ButtonModule } from 'primeng/button';
import { Observable, Subject, forkJoin, merge, of } from 'rxjs';


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
    ButtonModule
  ],
  styleUrls: ['./auctions-view.component.css'],
  providers: [DialogService, ConfirmationService,MessageService]
})
export class AuctionsViewComponent implements OnInit, OnDestroy {
  @ViewChild('auctionTable') auctionTable!: Table;
  
  auctions: (AuctionDetailsDto & { status: string, productImage?: string, productName?: string, stockId?: number, sellerName?: string })[] = [];
  loading = true;
  totalRecords = 0;
  rows = 10;
  first = 0;
  hoveredRow: number | null = null;
  productImages: { [auctionId: number]: string } = {};
  defaultImage = 'assets/default-product.png';
  userRole: string = '';
  userId: string = '';
  
  private destroy$ = new Subject<void>();
  private userRoleSet = new Subject<void>();
  private isUserContextInitialized = false;

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
    private ngZone: NgZone,
    private userService: UserService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    console.log('Initializing AuctionsViewComponent...');
    this.initializeUserContext();
    
    // Setup auction loading after user context is ready
    this.userRoleSet.pipe(
      takeUntil(this.destroy$),
      switchMap(() => {
        // Initial load
        this.loadAuctions();
        
        // Handle filter changes
        return merge(
          this.statusFilter.valueChanges,
          this.searchControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged()
          )
        );
      })
    ).subscribe(() => {
      this.first = 0;
      this.loadAuctions();
    });

    // SignalR setup
    this.signalRService.startConnection();
    this.setupSignalR();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    //this.signalRService.stopConnection();
  }

  private setupSignalR() {
    this.signalRService.bidPlaced$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.ngZone.run(() => {
        if (data?.Auction) {
          this.updateAuctionInList(data.Auction);
        }
      });
    });

    this.signalRService.auctionUpdate$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.ngZone.run(() => {
        if (data?.Auction) {
          this.updateAuctionInList(data.Auction);
        }
      });
    });

    this.signalRService.auctionCreated$.pipe(takeUntil(this.destroy$)).subscribe(() => this.loadAuctions());
    this.signalRService.auctionDeleted$.pipe(takeUntil(this.destroy$)).subscribe(() => this.loadAuctions());
  }

  initializeUserContext(): void {
    this.userService.getCurrentUser().subscribe({
      next: (response) => {
        const user: UserReadDto = response.data;
        this.userId = user.id;
        
        // Determine user role
        if (user.roles.includes('Admin')) {
          this.userRole = 'Admin';
          console.log('User role set to Admin');
        } else if (user.roles.includes('Seller')) {
          this.userRole = 'Seller';
          console.log('User role set to Seller');
        } else {
          this.userRole = 'Buyer';
          console.log('User role set to Buyer');
        }

        this.isUserContextInitialized = true;
        this.userRoleSet.next();
      },
      error: (err) => {
        console.error('Failed to initialize user context:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load user information'
        });
      }
    });
  }

  loadAuctions() {
    if (!this.isUserContextInitialized) {
      console.log('User context not initialized yet, skipping auction load');
      return;
    }
    
    this.loading = true;
    const status: string = this.statusFilter.value || '';
    const search = this.searchControl.value?.toLowerCase() || '';
    const page = Math.floor(this.first / this.rows) + 1;

    console.log(`Loading auctions for ${this.userRole}, status: ${status}, page: ${page}`);

    // If status is not allowed, clear auctions and return
    if (status && !this.allowedStatusValues.includes(status)) {
      this.auctions = [];
      this.totalRecords = 0;
      this.loading = false;
      return;
    }

    // Use different service method based on user role
    if (this.userRole === 'Admin') {
      this.loadAdminAuctions(page, search);
    } else if (this.userRole === 'Seller') {
      this.loadSellerAuctions(page, status, search);
    } else {
      // For buyers, we might not show any auctions or show different ones
      this.loading = false;
      this.messageService.add({
        severity: 'info',
        summary: 'Information',
        detail: 'Buyers cannot manage auctions'
      });
      this.auctions = [];
      this.totalRecords = 0;
    }
  }

  private loadAdminAuctions(page: number, search: string) {
    this.auctionService.getAdminAuctions(page, this.rows)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: PagedResponse<AuctionDetailsDto>) => {
          this.processAuctions(response.data, response.totalCount, search, true);
        },
        error: (err) => this.handleAuctionError(err)
      });
  }

  private loadSellerAuctions(page: number, status: string, search: string) {
    this.auctionService.getSellerAuctions(page, this.rows, status, this.userId)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: PagedResponse<AuctionDetailsDto>) => {
          this.processAuctions(response.data, response.totalCount, search, false);
        },
        error: (err) => this.handleAuctionError(err)
      });
  }

  private processAuctions(
    auctions: AuctionDetailsDto[], 
    totalRecords: number,
    search: string,
    isAdmin: boolean
  ) {
    let processedAuctions = auctions.map(auction => ({
      ...auction,
      status: this.calculateStatus(auction),
      productName: '',
      stockId: auction.stockId,
      sellerName: ''
    }));

    // Apply search filter if needed
    if (search) {
      processedAuctions = processedAuctions.filter(a =>
        a.name?.toLowerCase().includes(search) ||
        (a.productName && a.productName.toLowerCase().includes(search)) ||
        (a.stockId && a.stockId.toString().includes(search))
      );
    }

    // Prepare all fetch operations
    const fetchOperations: Observable<any>[] = [];
    
    processedAuctions.forEach((auction, idx) => {
      // Fetch product details
      fetchOperations.push(
        this.productService.getProductsDetails(auction.productId).pipe(
          tap(response => {
            const product = response.data;
            const imageUrl = product?.imagesArr?.[0] || this.defaultImage;
            this.productImages[auction.id] = imageUrl;
            processedAuctions[idx].productName = product?.name || '';
          }),
          catchError(() => {
            processedAuctions[idx].productName = 'Unknown Product';
            return of(null);
          })
        )
      );

      // Fetch seller names only for admin
      if (isAdmin && auction.sellerId) {
        fetchOperations.push(
          this.userService.getUserById(auction.sellerId).pipe(
            tap(res => {
              processedAuctions[idx].sellerName = 
                `${res.data?.firstName || ''} ${res.data?.lastName || ''}`.trim();
            }),
            catchError(() => {
              processedAuctions[idx].sellerName = 'Unknown Seller';
              return of(null);
            })
          )
        );
      }
    });

    // Wait for all fetch operations to complete or handle empty case
    if (fetchOperations.length > 0) {
      forkJoin(fetchOperations).subscribe(() => {
        this.auctions = processedAuctions;
        this.totalRecords = totalRecords;
        this.cdRef.detectChanges();
      });
    } else {
      this.auctions = processedAuctions;
      this.totalRecords = totalRecords;
    }
  }

  private handleAuctionError(err: any) {
    console.error('Error loading auctions:', err);
    
    if (err.status === 404) {
      this.auctions = [];
      this.totalRecords = 0;
      this.messageService.add({
        severity: 'info',
        summary: 'No Auctions Found',
        detail: 'No auctions match your current filters'
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load auctions'
      });
    }
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
    const now = new Date();
    const start = new Date(auction.startTime);
    const end = new Date(auction.endTime);
  
    let currentStatus = 'Upcoming';
    if (now >= start && now <= end) currentStatus = 'Active';
    if (now > end) currentStatus = 'Closed';
  
    const editableFields = this.getEditableFieldsByStatus(currentStatus);
  
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
    if (status === 'Upcoming') return ['name', 'description', 'startTime', 'endTime', 'startingPrice'];
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
    if (this.userRole=='Admin')
      return true;
    const now = new Date();
    const start = new Date(auction.startTime);
    const end = new Date(auction.endTime);
    
    // Can delete if auction is upcoming or closed
    return now < start || now > end;
  }

  canEndNow(auction: any): boolean {
    const now = new Date();
    const start = new Date(auction.startTime);
    const end = new Date(auction.endTime);
    
    // Can end now if auction is active (started but not ended)
    return now >= start && now <= end;
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
        this.auctionService.deleteAuction(auctionId).subscribe({
          next: () => {
            this.loadAuctions();
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Auction deleted successfully'
            });
          },
          error: (err) => {
            console.error('Failed to delete auction:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete auction'
            });
          }
        });
      }
    });
  }

  confirmEndNow(auction: any) {
    this.confirmationService.confirm({
      message: `Are you sure you want to end this auction now? This will immediately close the auction and process the winning bid.`,
      header: 'Confirm End Auction',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.endAuctionNow(auction);
      }
    });
  }

  endAuctionNow(auction: any) {
    const nowPlusOneMinute = new Date(Date.now() + 60 * 1000); // 60,000 ms = 1 minute

    const updateData = {
      endTime: nowPlusOneMinute.toISOString()
    };

    this.auctionService.updateAuction(auction.id, updateData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Auction ended successfully'
        });
        this.loadAuctions();
      },
      error: (err) => {
        console.error('Failed to end auction:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to end auction'
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