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

@Component({
  selector: 'app-order-request-details',
  templateUrl: './order-request-details.component.html',
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
  ],
})
export class OrderRequestDetailsComponent implements OnInit {
  orders: SellerOrder[] = [];
  filteredOrders: SellerOrder[] = [];
  loading = true;
  error: string | null = null;

  searchTerm: string = '';
  statusFilter: string = '';
  orderStatusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Cancelled', value: 'Cancelled' },
    { label: 'Processing', value: 'Processing' },
  ];

  // Pagination
  page: number = 0;
  rows: number = 10;
  totalRecords: number = 0;
  pagedOrders: SellerOrder[] = [];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getBuyerRequestOrders().subscribe({
      next: (res: { data: SellerOrder[] }) => {
        this.orders = res.data;
        this.totalRecords = this.orders.length;
        this.filterOrders();
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load order requests.';
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

  onPageChange(event: any) {
    this.page = event.page;
    this.rows = event.rows;
    this.updatePagedOrders();
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
