// auction-order-management.component.ts
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuctionService } from '../../../../core/services/auction.service';
import { AuctionOrderDto, OrderStatus } from '../../../../core/models/auction-models/auction-order-dto';
import { AuctionOrderService } from '../../../../core/services/auction-order.service';
import { UserService } from '../../../../core/services/user.service';
import { switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { UserReadDto } from '../../../../core/models/user-models/user-read.dto';
import { Router } from '@angular/router';
import { BidService } from '../../../../core/services/bid.service';

@Component({
  selector: 'app-auction-order-management',
  imports: [
    TableModule,
    DialogModule,
    DropdownModule,
    ConfirmDialogModule,
    ToastModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './auction-order-management.component.html',
  styleUrls: ['./auction-order-management.component.css'],
  providers: [ConfirmationService, MessageService]
})
export class AuctionOrderManagementComponent implements OnInit {
  @Output() viewAuction = new EventEmitter<string>();
  // userRole: 'Seller' | 'Admin' | 'Buyer' = 'Seller';
  userRole: string = 'Seller';

  userId: string = '';
  
  orders: AuctionOrderDto[] = [];
  loading = true;
  statusOptions: any[] = [];
  orderDetailsVisible = false;
  selectedOrder: AuctionOrderDto | null = null;
  statusChangeLoading = false;
  showSellerColumn = false;
  showBuyerColumn = false;
  
  // Valid status transitions
  statusTransitions = {
    Seller: {
      [OrderStatus.Pending]: [OrderStatus.Ready, OrderStatus.Cancelled],
      [OrderStatus.PendingSeller]: [OrderStatus.Ready, OrderStatus.Cancelled],
      [OrderStatus.Processing]: [OrderStatus.Ready, OrderStatus.Cancelled],
      [OrderStatus.PaymentFailed]: [OrderStatus.Cancelled],
      [OrderStatus.Ready]: [] // No further actions for seller
    },
    Buyer: {
      [OrderStatus.PendingBuyer]: [OrderStatus.Cancelled],
      [OrderStatus.PaymentFailed]: [OrderStatus.Cancelled],
      [OrderStatus.Ready]: [OrderStatus.Cancelled],
      [OrderStatus.Shipped]: [OrderStatus.Cancelled],
      [OrderStatus.Delivered]: [OrderStatus.Cancelled]
    },
    Admin: {
      [OrderStatus.Ready]: [OrderStatus.Shipped, OrderStatus.Cancelled],
      [OrderStatus.Shipped]: [OrderStatus.Delivered],
      [OrderStatus.Delivered]: [OrderStatus.Completed],
      [OrderStatus.PaymentFailed]: [OrderStatus.Cancelled]
    }
  };

  cols: any[] = [];

  constructor(
    private auctionService: AuctionService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private auctionOrderService: AuctionOrderService,
    private userService: UserService,
    private router: Router,
    private bidService: BidService
  ) {}

  ngOnInit() {
    this.initializeUserContext();
  }

  initializeUserContext(): void {
    this.userService.getCurrentUser().subscribe({
      next: (response) => {
        const user: UserReadDto = response.data;
        this.userId = user.id;
        
        // Determine user role
        if (user.roles.includes('Admin')) {
          this.userRole = 'Admin';
        } else if (user.roles.includes('Seller')) {
          this.userRole = 'Seller';
        } else {
          this.userRole = 'Buyer';
        }

        // Configure columns based on role
        this.configureColumns();
        this.loadOrders();
      },
      error: (err) => {
        console.error('Failed to initialize user context:', err);
      }
    });
  }
  
  configureColumns(): void {
    this.cols = [
      { field: 'id', header: 'Order ID' },
      { field: 'orderDate', header: 'Order Date' },
      { field: 'auctionTitle', header: 'Auction' }
    ];
    
    // Add seller column for admins and buyers
    if (this.userRole === 'Admin' || this.userRole === 'Buyer') {
      this.cols.push({ field: 'sellerName', header: 'Seller' });
      this.showSellerColumn = true;
    }
    
    // Add buyer column for admins and sellers
    if (this.userRole === 'Admin' || this.userRole === 'Seller') {
      this.cols.push({ field: 'buyerName', header: 'Buyer' });
      this.showBuyerColumn = true;
    }
    
    // Add common columns
    this.cols.push(
      { field: 'amountPaid', header: 'Amount' },
      { field: 'status', header: 'Status' }
    );
  }

  loadOrders() {
    this.loading = true;
    if (this.userRole === 'Admin') {
      // Admin gets all orders
      this.auctionOrderService.getAllOrders().subscribe({
        next: (orders) => {
          this.orders = orders;
          this.loading = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load orders'
          });
          this.loading = false;
        }
      });
    } else {
      // Seller/Buyer gets their own orders
      this.auctionOrderService.getUserOrders(this.userId).subscribe({
        next: (orders) => {
          this.orders = orders;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  getStatusClass(status: OrderStatus): string {
    const statusClasses = {
      [OrderStatus.Completed]: 'bg-green-100 text-green-800',
      [OrderStatus.Ready]: 'bg-blue-100 text-blue-800',
      [OrderStatus.Shipped]: 'bg-indigo-100 text-indigo-800',
      [OrderStatus.Delivered]: 'bg-purple-100 text-purple-800',
      [OrderStatus.Payed]: 'bg-teal-100 text-teal-800',
      [OrderStatus.Pending]: 'bg-yellow-100 text-yellow-800',
      [OrderStatus.PendingSeller]: 'bg-amber-100 text-amber-800',
      [OrderStatus.PendingBuyer]: 'bg-orange-100 text-orange-800',
      [OrderStatus.Processing]: 'bg-cyan-100 text-cyan-800',
      [OrderStatus.Cancelled]: 'bg-red-100 text-red-800',
      [OrderStatus.PaymentFailed]: 'bg-rose-100 text-rose-800'
    };
    return `px-3 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  }

  getValidStatuses(currentStatus: OrderStatus): OrderStatus[] {
    return (this.statusTransitions as any)[this.userRole][currentStatus] || [];
  }

  showOrderDetails(order: AuctionOrderDto) {
    this.selectedOrder = order;
    this.orderDetailsVisible = true;

    // if (order.winningBidId) {
    //   this.bidService.(order.winningBidId).subscribe({
    //     next: (bid) => {
    //       this.selectedOrder['buyerId'] = bid.userId; // Not strongly typed, but works
    //       this.selectedOrder['buyerName'] = bid.userName; // optional
    //     },
    //     error: () => {
    //       this.selectedOrder['buyerId'] = 'Unknown';
    //     }
    //   });
    // }
  }

  // New: Handle row click to view auction
  onRowClick(order: AuctionOrderDto) {
    if (order.auctionId) {
      this.router.navigate(['/seller/auctions', order.auctionId]);
    }
  }

  // New: Show pay button for specific buyer statuses
  showPayButton(status: OrderStatus): boolean {
    return [OrderStatus.PendingBuyer, OrderStatus.PaymentFailed].includes(status);
  }

  // New: Payment initiation (mock)
  initiatePayment(order: AuctionOrderDto) {
    this.confirmationService.confirm({
      message: `Initiate payment for order ${order.id}? (Mock operation)`,
      header: 'Confirm Payment',
      icon: 'pi pi-dollar',
      accept: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Payment Initiated',
          detail: 'Payment functionality would be implemented here'
        });
      }
    });
  }

  confirmStatusChange(order: AuctionOrderDto, newStatus: OrderStatus) {
    this.confirmationService.confirm({
      message: `Are you sure you want to change order status to <strong>${newStatus}</strong>?`,
      header: 'Confirm Status Change',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.updateOrderStatus(order, newStatus);
      }
    });
  }

  updateOrderStatus(order: AuctionOrderDto, newStatus: OrderStatus) {
    this.statusChangeLoading = true;
    this.auctionOrderService.updateOrderStatus(order.id, newStatus).subscribe({
      next: () => {
        order.status = newStatus;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Order status updated'
        });
        this.statusChangeLoading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update order status'
        });
        this.statusChangeLoading = false;
      }
    });
  }
}