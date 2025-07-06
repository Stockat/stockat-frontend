import { Component, OnInit } from '@angular/core';
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
  imports: [TableModule, ButtonModule, DropdownModule, ToastModule, CardModule, BadgeModule, FormsModule, CommonModule, Tooltip, InputTextModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
  providers: [MessageService]
})
export class AdminOrdersComponent implements OnInit {
  orders: AdminOrder[] = [];
  loading = false;
  statusFilter: string = '';
  globalFilter: string = '';

  constructor(private orderService: OrderService, private messageService: MessageService) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  get pendingCount(): number {
    return this.orders.filter(o => o.status === 'Pending').length;
  }

  get processingCount(): number {
    return this.orders.filter(o => o.status === 'Processing').length;
  }

  get readyCount(): number {
    return this.orders.filter(o => o.status === 'Ready').length;
  }

  get shippedCount(): number {
    return this.orders.filter(o => o.status === 'Shipped').length;
  }

  fetchOrders() {
    this.loading = true;
    this.orderService.getAdminOrders().subscribe({
      next: (res) => {
        this.orders = res.data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch orders.' });
        this.loading = false;
      }
    });
  }

  canCancel(order: AdminOrder) {
    return !['Delivered', 'Completed'].includes(order.status);
  }

  canChangeStatus(order: AdminOrder) {
    return order.status === 'Ready';
  }

  updateStatus(order: AdminOrder, newStatus: string) {
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
} 