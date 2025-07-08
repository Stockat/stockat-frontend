import { Component, OnInit, ViewChild } from '@angular/core';
import { SellerOrder } from '../../../core/models/order-models/seller-order.model';
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

const SELLER_STATUSES = [
  { label: 'Processing', value: 'Processing' },
  { label: 'Ready', value: 'Ready' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Shipped', value: 'Shipped', readonly: true },
  { label: 'Completed', value: 'Completed', readonly: true },
  { label: 'Cancelled', value: 'Cancelled' },
  { label: 'Delivered', value: 'Delivered', readonly: true },
];

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [TableModule, ButtonModule, DropdownModule, ToastModule, CardModule, BadgeModule, FormsModule, CommonModule, Tooltip, InputTextModule, TagModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
  providers: [MessageService]
})
export class OrdersComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  orders: SellerOrder[] = [];
  loading = false;
  statusFilter: string = '';
  globalFilter: string = '';

  searchValue: string | undefined;

  constructor(private orderService: OrderService, private messageService: MessageService) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  clear(table: Table) {
    table.clear();
    this.searchValue = ''
  }

  fetchOrders() {
    this.loading = true;
    this.orderService.getSellerOrders().subscribe({
      next: (res) => {
        this.orders = res.data;
        this.loading = false;
        console.log(res);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch orders.' });
        this.loading = false;
      }
    });
  }

  canConfirm(order: SellerOrder) {
    return order.status === 'Pending';
  }
  canReject(order: SellerOrder) {
    return order.status === 'Pending';
  }
  canSetReady(order: SellerOrder) {
    return order.status === 'Processing';
  }
  canCancel(order: SellerOrder) {
    return order.status === 'Processing';
  }
  isReadOnly(order: SellerOrder) {
    return ['Shipped', 'Completed', 'Delivered'].includes(order.status);
  }

  updateStatus(order: SellerOrder, newStatus: string) {
    this.loading = true;
    this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Order status updated.' });
        this.fetchOrders();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update status.' });
        this.loading = false;
      }
    });
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'Pending':
        return 'warning';
      case 'Processing':
        return 'info';
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
