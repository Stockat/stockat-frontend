import { Component, OnInit, ViewChild } from '@angular/core';
import { AdminOrder } from '../../../core/models/order-models/admin-order.model';
import { OrderService } from '../../../core/services/order.service';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Tooltip } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';

const ADMIN_STATUSES = [
  { label: 'Processing', value: 'Processing' },
  { label: 'Ready', value: 'Ready' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Shipped', value: 'Shipped' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Cancelled', value: 'Cancelled' },
  { label: 'Delivered', value: 'Delivered' },
];

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    DropdownModule,
    ToastModule,
    CardModule,
    BadgeModule,
    FormsModule,
    CommonModule,
    Tooltip,
    InputTextModule,
    TagModule,
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
  providers: [MessageService],
})
export class AdminOrdersComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  orders: AdminOrder[] = [];
  loading = false;
  statusFilter: string = '';
  orderTypeFilter: string = '';
  globalFilter: string = '';

  constructor(
    private orderService: OrderService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  get pendingCount(): number {
    return this.orders.filter((o) => o.status === 'Pending').length;
  }

  get processingCount(): number {
    return this.orders.filter((o) => o.status === 'Processing').length;
  }

  get readyCount(): number {
    return this.orders.filter((o) => o.status === 'Ready').length;
  }

  get shippedCount(): number {
    return this.orders.filter((o) => o.status === 'Shipped').length;
  }

  get deliveredCount(): number {
    return this.orders.filter((o) => o.status === 'Delivered').length;
  }

  get cancelledCount(): number {
    return this.orders.filter((o) => o.status === 'Cancelled').length;
  }

  get pendingSellerCount(): number {
    return this.orders.filter((o) => o.status === 'PendingSeller').length;
  }

  get pendingBuyerCount(): number {
    return this.orders.filter((o) => o.status === 'PendingBuyer').length;
  }

  fetchOrders() {
    this.loading = true;
    this.orderService.getAdminOrders().subscribe({
      next: (res) => {
        this.orders = res.data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch orders.',
        });
        this.loading = false;
      },
    });
  }

  canCancel(order: AdminOrder) {
    return !['Delivered', 'Cancelled'].includes(order.status);
  }

  canShip(order: AdminOrder) {
    return order.status === 'Ready';
  }

  canDeliver(order: AdminOrder) {
    return order.status === 'Shipped';
  }

  canChangeStatus(order: AdminOrder) {
    return this.canShip(order) || this.canDeliver(order);
  }

  updateStatus(order: AdminOrder, newStatus: string) {
    this.loading = true;
    this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Order status updated.',
        });
        this.fetchOrders();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update status.',
        });
        this.loading = false;
      },
    });
  }

  clearFilters() {
    this.statusFilter = '';
    this.orderTypeFilter = '';
    this.globalFilter = '';
    // Reset table filters
    if (this.dt) {
      this.dt.filter('', 'status', 'equals');
      this.dt.filter('', 'orderType', 'equals');
      this.dt.filterGlobal('', 'contains');
    }
  }

  refreshData() {
    this.fetchOrders();
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'Pending':
        return 'info';
      case 'Processing':
        return 'warning';
      case 'Ready':
        return 'success';
      case 'Shipped':
        return 'secondary';
      case 'Completed':
        return 'success';
      case 'Delivered':
        return 'success';
      case 'Cancelled':
        return 'danger';
      default:
        return 'info';
    }
  }
}
