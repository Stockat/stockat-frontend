import { Component, OnInit, ViewChild } from '@angular/core';
import { SellerOrder } from '../../../../../core/models/order-models/seller-order.model';
import { OrderService } from '../../../../../core/services/order.service';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Tooltip } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { TagModule } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';

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
  selector: 'app-request-order',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    DropdownModule,
    ToastModule,
    CardModule,
    BadgeModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    Tooltip,
    InputTextModule,
    InputNumberModule,
    CalendarModule,
    TagModule,
    Dialog,
  ],
  templateUrl: './request-order.component.html',
  providers: [MessageService],
})
export class RequestOrderComponent {
  @ViewChild('dt') dt!: Table;
  orders: SellerOrder[] = [];
  loading = false;
  statusFilter: string = '';
  globalFilter: string = '';
  visible = false;
  orderForm: FormGroup;
  minDate: Date = new Date();
  selectedOrder: SellerOrder | null = null;

  searchValue: string | undefined;

  constructor(
    private orderService: OrderService,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {
    this.orderForm = this.fb.group({
      price: [null, [Validators.required, Validators.min(0.01)]],
      deliveryDate: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.fetchOrders();
  }

  clear(table: Table) {
    table.clear();
    this.searchValue = '';
    this.statusFilter = '';
    this.globalFilter = '';
  }

  fetchOrders() {
    this.loading = true;
    this.orderService.getSellerRequestOrders().subscribe({
      next: (res) => {
        this.orders = res.data;
        this.loading = false;
        console.log(res);
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

  canConfirm(order: SellerOrder) {
    return order.status === 'PendingSeller';
  }
  canReject(order: SellerOrder) {
    return order.status === 'PendingSeller';
  }
  canSetReady(order: SellerOrder) {
    return order.status === 'Processing';
  }
  canCancel(order: SellerOrder) {
    return order.status === 'Processing' || order.status === 'PendingBuyer';
  }
  isReadOnly(order: SellerOrder) {
    return ['Shipped', 'Completed', 'Delivered'].includes(order.status);
  }

  updateStatus(order: SellerOrder, newStatus: string) {
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

  showDialog(order: SellerOrder) {
    this.selectedOrder = order;
    this.visible = true;
    this.orderForm.reset();
  }

  onDateSelect(event: any) {
    const selectedDate = new Date(event);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      this.orderForm.get('deliveryDate')?.setErrors({ invalidDate: true });
    } else {
      this.orderForm.get('deliveryDate')?.setErrors(null);
    }
  }

  isFormValid(): boolean {
    return this.orderForm.valid;
  }

  confirmOrder() {
    if (this.isFormValid()) {
      const formValue = this.orderForm.value;
      console.log('Form submitted:', formValue);

      this.orderService
        .updateRequestOrder(this.selectedOrder!.id, formValue)
        .subscribe({
          next: (res) => {
            console.log(res);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Order Request updated successfully.',
            });
            this.fetchOrders();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update order request.',
            });
          },
        });

      this.visible = false;
    }
  }

  closeDialog() {
    this.visible = false;
    this.orderForm.reset();
  }
}
