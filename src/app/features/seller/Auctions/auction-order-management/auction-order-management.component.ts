// auction-order-management.component.ts
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuctionService } from '../../../../core/services/auction.service';
import { AuctionOrderDto, OrderStatus ,PaymentStatus} from '../../../../core/models/auction-models/auction-order-dto';
import { AuctionOrderService } from '../../../../core/services/auction-order.service';
import { UserService } from '../../../../core/services/user.service';
import { switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { UserReadDto } from '../../../../core/models/user-models/user-read.dto';
import { Router } from '@angular/router';
import { BidService } from '../../../../core/services/bid.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-auction-order-management',
  imports: [
    TableModule,
    DialogModule,
    DropdownModule,
    ConfirmDialogModule,
    ToastModule,
    CommonModule,
    FormsModule,
    ButtonModule
  ],
  templateUrl: './auction-order-management.component.html',
  styleUrls: ['./auction-order-management.component.css'],
  providers: [ConfirmationService, MessageService]
})
export class AuctionOrderManagementComponent implements OnInit {
  orders: AuctionOrderDto[] = [];
  selectedOrder: AuctionOrderDto | null = null;
  userId: string | null = null;
  userRole: 'Admin' | 'Seller' | 'Buyer' = 'Buyer';
  loading = false;
  statusChangeLoading = false;
  orderDetailsVisible = false;
  showAddressDialog = false;
  addressOrderId: number | null = null;
  addressForm: any = {};
  isSellerOfThisOrder = false;
  isBuyerOfThisOrder = false;
  
  cols: any[] = [];
  showSellerColumn = false;
  showBuyerColumn = false;

  statusTransitions = {
    Admin: {
      [OrderStatus.PendingSeller]: [ OrderStatus.Cancelled],
      [OrderStatus.PendingBuyer]: [ OrderStatus.Cancelled],
      [OrderStatus.Pending]: [OrderStatus.Cancelled],
      [OrderStatus.Processing]: [OrderStatus.Shipped, OrderStatus.Cancelled],
      [OrderStatus.Ready]: [ OrderStatus.Cancelled],
      [OrderStatus.Shipped]: [OrderStatus.Delivered, OrderStatus.Cancelled],
      [OrderStatus.Delivered]: [OrderStatus.Completed],
      [OrderStatus.PaymentFailed]: [OrderStatus.Cancelled]
    },
    Seller: {
      [OrderStatus.PendingSeller]: [OrderStatus.Processing, OrderStatus.Cancelled],
      [OrderStatus.PendingBuyer]: [ OrderStatus.Cancelled],
      [OrderStatus.Pending]: [ OrderStatus.Cancelled],
      [OrderStatus.Processing]: [OrderStatus.Ready, OrderStatus.Cancelled],
      [OrderStatus.PaymentFailed]: [ OrderStatus.Cancelled]
    },
    Buyer: {
      [OrderStatus.PendingBuyer]: [OrderStatus.Cancelled],
      [OrderStatus.Pending]: [OrderStatus.Cancelled],
      [OrderStatus.PaymentFailed]: [ OrderStatus.Cancelled]
    }
  };

  constructor(
    private auctionOrderService: AuctionOrderService,
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initializeUserContext();
  }

  initializeUserContext(): void {
    this.userService.getCurrentUser().subscribe({
      next: (response) => {
        const user = response.data;
        this.userId = user.id;
        
        // Determine user role
        if (user.roles.includes('Admin')) {
          this.userRole = 'Admin';
        } else if (user.roles.includes('Seller')) {
          this.userRole = 'Seller';
        } else {
          this.userRole = 'Buyer';
        }

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
    
    const request = this.userRole === 'Admin' 
      ? this.auctionOrderService.getAllOrders()
      : this.auctionOrderService.getUserOrders(this.userId!);

    request.subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load orders'
        });
      }
    });
  }

  getStatusClass(status: OrderStatus): string {
    const statusClasses: Record<OrderStatus, string> = {
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
    if (!this.selectedOrder) return [];
    
    if (this.isSellerOfThisOrder) {
      return (this.statusTransitions.Seller as any)[currentStatus] || [];
    }
    
    if (this.isBuyerOfThisOrder) {
      return (this.statusTransitions.Buyer as any)[currentStatus] || [];
    }
    
    if (this.userRole === 'Admin') {
      return (this.statusTransitions.Admin as any)[currentStatus] || [];
    }
    
    return [];
  }

  showPayButton(status: OrderStatus): boolean {
    return this.isBuyerOfThisOrder && 
           (status === OrderStatus.PendingBuyer || status === OrderStatus.Pending);
  }

  showMarkDeliveredButton(status: OrderStatus): boolean {
    return this.userRole === 'Admin' && status === OrderStatus.Shipped;
  }

  showMarkCompletedButton(status: OrderStatus): boolean {
    return this.userRole === 'Admin' && status === OrderStatus.Delivered;
  }

  openAddressDialog(order: AuctionOrderDto) {
    this.addressOrderId = order.id;
    this.addressForm = {
      shippingAddress: order.shippingAddress || '',
      recipientName: order.recipientName || '',
      phoneNumber: order.phoneNumber || '',
      notes: order.notes || ''
    };
    this.showAddressDialog = true;
  }

  saveAddressInfo() {
    if (!this.addressOrderId) return;
    
    this.auctionOrderService.updateOrderAddressInfo(this.addressOrderId, this.addressForm)
      .subscribe({
        next: () => {
          this.showAddressDialog = false;
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Success', 
            detail: 'Shipping information saved' 
          });
          this.loadOrders();

          ////Buttons update here///////
          this.selectedOrder = null; // Optional: deselect to trigger reset

          this.cdr.detectChanges();
        },
        error: () => {
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to save shipping information' 
          });
        }
      });
  }

  showOrderDetails(order: AuctionOrderDto) {
    this.selectedOrder = order;
    this.orderDetailsVisible = true;

    console.log(this.selectedOrder);
    
    // Determine ownership using DTO data
    this.isSellerOfThisOrder = this.userId === order.sellerId;
    this.isBuyerOfThisOrder = this.userId === order.buyerId;
  }

  onRowClick(order: AuctionOrderDto) {
    if (order.auctionId) {
      this.router.navigate(['/auctions', order.auctionId]);
    }
  }

  confirmStatusChange(order: AuctionOrderDto, newStatus: OrderStatus) {
    this.confirmationService.confirm({
      message: `Change status to <strong>${newStatus}</strong>?`,
      header: 'Confirm Status Change',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.updateOrderStatus(order, newStatus)
    });
  }

  updateOrderStatus(order: AuctionOrderDto, newStatus: OrderStatus) {
    this.statusChangeLoading = true;
    this.auctionOrderService.updateOrderStatus(order.id, newStatus)
      .subscribe({
        next: () => {
          order.status = newStatus;
          this.statusChangeLoading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Status updated'
          });
          this.cdr.markForCheck();
        },
        error: () => {
          this.statusChangeLoading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update status'
          });
        }
      });
  }

  markAsDelivered(order: AuctionOrderDto) {
    this.updateOrderStatus(order, OrderStatus.Delivered);
  }

  markAsCompleted(order: AuctionOrderDto) {
    this.updateOrderStatus(order, OrderStatus.Completed);
  }

  getStatusforPaymentClass(status: string): string {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Refunded': return 'bg-gray-100 text-gray-800';
      default: return '';
    }
  }

  canProceedToPayment(order: AuctionOrderDto): boolean {
    // Convert string to enum value (if necessary)
    const paymentStatusValue =
      typeof order.paymentStatus === 'string'
        ? PaymentStatus[order.paymentStatus as keyof typeof PaymentStatus]
        : order.paymentStatus;
  
    const orderStatusValue =
      typeof order.status === 'string'
        ? OrderStatus[order.status as keyof typeof OrderStatus]
        : order.status;
  
    return this.isBuyerOfThisOrder &&
           paymentStatusValue === PaymentStatus.Pending &&
           (orderStatusValue === OrderStatus.Pending || 
            orderStatusValue === OrderStatus.PendingBuyer)&&
            order.shippingAddress!=null;
    }

  isShippingInfoMissing(order: AuctionOrderDto): boolean {
    return !order.shippingAddress || 
           !order.recipientName || 
           !order.phoneNumber;
  }



  proceedToPayment(order: AuctionOrderDto) {
    if (!this.canProceedToPayment(order)) return;

    this.auctionOrderService.createStripeCheckoutSession(order.id)
      .subscribe({
        next: (response) => {
          if (response.redirectUrl) {
            window.location.href = response.redirectUrl;
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Payment Error',
              detail: 'No redirect URL received from payment service'
            });
          }
        },
        error: (error) => {
          console.error('Payment error:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Payment Error',
            detail: error.error?.message || error.message || 'Failed to create payment session'
          });
        }
      });
  }
}