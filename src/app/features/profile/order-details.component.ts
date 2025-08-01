import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../core/services/order.service';
import { SellerOrder } from '../../core/models/order-models/seller-order.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { QRCodeComponent } from 'angularx-qrcode';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ProgressSpinnerModule,
    RouterModule,
    DropdownModule,
    FormsModule,
    TagModule,
    ButtonModule,
    PaginatorModule,
    QRCodeComponent,
    DialogModule
  ],
})
export class OrderDetailsComponent implements OnInit {
  orders: SellerOrder[] = [];
  filteredOrders: SellerOrder[] = [];
  loading = true;
  error: string | null = null;

  searchTerm: string = '';
  statusFilter: string = '';
  orderStatusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Processing', value: 'Processing' },
    { label: 'Ready', value: 'Ready' },
    { label: 'Shipped', value: 'Shipped' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  // Pagination
  page: number = 0;
  rows: number = 10;
  totalRecords: number = 0;
  pagedOrders: SellerOrder[] = [];

  selectedOrder: SellerOrder | null = null;
  showOrderDialog = false;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getBuyerOrders().subscribe({
      next: (res: { data: SellerOrder[] }) => {
        console.log(res);
        this.orders = res.data;
        this.totalRecords = this.orders.length;
        this.filterOrders();
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load orders.';
        this.loading = false;
      },
    });
  }

  filterOrders() {
    let filtered = this.orders.filter((order) => {
      const matchesStatus = this.statusFilter
        ? order.status === this.statusFilter
        : true;
      const matchesSearch = this.searchTerm
        ? (order.sellerFirstName + ' ' + order.sellerLastName)
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          order.status.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true;
      return matchesStatus && matchesSearch;
    });
    this.filteredOrders = filtered;
    this.totalRecords = filtered.length;
    this.page = 0; // Reset to first page on filter
    this.updatePagedOrders();
  }

  updatePagedOrders() {
    const start = this.page * this.rows;
    const end = start + this.rows;
    this.pagedOrders = this.filteredOrders.slice(start, end);
  }

  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.filterOrders();
  }

  onPageChange(event: any) {
    this.page = event.page;
    this.rows = event.rows;
    this.updatePagedOrders();
  }

  openOrderDialog(order: SellerOrder) {
    this.selectedOrder = order;
    this.showOrderDialog = true;
  }
  closeOrderDialog() {
    this.showOrderDialog = false;
    this.selectedOrder = null;
  }
  getOrderQRData(order: SellerOrder): string {
    return JSON.stringify({
      id: order.id,
      seller: `${order.sellerFirstName} ${order.sellerLastName}`,
      quantity: order.quantity,
      price: order.price,
      status: order.status,
      payment: order.paymentStatus
    });
  }

  get pendingOrdersCount(): number {
    return this.orders.filter((o) => o.status === 'Pending').length;
  }
  get completedOrdersCount(): number {
    return this.orders.filter((o) => o.status === 'Delivered').length;
  }
  get cancelledOrdersCount(): number {
    return this.orders.filter((o) => o.status === 'Cancelled').length;
  }
  get totalOrdersCount(): number {
    return this.orders.length;
  }

  getOrderStatusSeverity(status: string): string {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Cancelled':
        return 'danger';
      case 'Processing':
        return 'info';
      default:
        return 'info';
    }
  }
  getPaymentStatusSeverity(status: string): string {
    switch (status) {
      case 'Paid':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Failed':
        return 'danger';
      default:
        return 'info';
    }
  }
}
