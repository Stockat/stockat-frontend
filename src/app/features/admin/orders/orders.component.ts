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
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';

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
    OverlayPanelModule,
    DialogModule,
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
  providers: [MessageService],
})
export class AdminOrdersComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  @ViewChild('op') op: any;

  orders: AdminOrder[] = [];
  drivers: any[] = [];
  loading = false;
  statusFilter: string = '';
  orderTypeFilter: string = '';
  globalFilter: string = '';

  // Properties for overlay panel
  selectedStockId: number = 0;
  selectedProductName: string = '';
  selectedQuantity: number = 0;
  selectedPrice: number = 0;
  selectedOrderType: string = '';
  selectedStatus: string = '';
  selectedDescription: string = '';

  // Properties for driver assignment
  selectedOrderForDriver: AdminOrder | null = null;
  selectedDriverId: string = '';
  showDriverSelection = false;

  statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Processing', value: 'Processing' },
    { label: 'Shipped', value: 'Shipped' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Cancelled', value: 'Cancelled' },
    { label: 'Pending Seller', value: 'PendingSeller' },
    { label: 'Pending Buyer', value: 'PendingBuyer' },
  ];

  private orderStatusOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Processing', value: 'Processing' },
    { label: 'Shipped', value: 'Shipped' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  private requestStatusOptions = [
    { label: 'Pending Seller', value: 'PendingSeller' },
    { label: 'Pending Buyer', value: 'PendingBuyer' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Processing', value: 'Processing' },
    { label: 'Shipped', value: 'Shipped' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  constructor(
    private orderService: OrderService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchOrders();
    this.fetchDrivers();
    this.updateStatusOptions();
  }

  updateStatusOptions() {
    if (this.orderTypeFilter === 'Order') {
      this.statusOptions = [
        { label: 'All Status', value: '' },
        ...this.orderStatusOptions,
      ];
    } else if (this.orderTypeFilter === 'Request') {
      this.statusOptions = [
        { label: 'All Status', value: '' },
        ...this.requestStatusOptions,
      ];
    } else {
      // Union of both, no duplicates
      const union = [
        ...this.orderStatusOptions,
        ...this.requestStatusOptions.filter(
          (s) => !this.orderStatusOptions.some((os) => os.value === s.value)
        ),
      ];
      this.statusOptions = [{ label: 'All Status', value: '' }, ...union];
    }
    // Reset status filter if current value is not in the new options
    if (!this.statusOptions.some((opt) => opt.value === this.statusFilter)) {
      this.statusFilter = '';
    }
  }

  onOrderTypeChange() {
    this.updateStatusOptions();
    if (this.dt) {
      this.dt.filter(this.orderTypeFilter, 'orderType', 'equals');
    }
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
        console.log(res);
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

  fetchDrivers() {
    this.orderService.getAllDrivers().subscribe({
      next: (res) => {
        this.drivers = res.data;
      },
      error: (error) => {
        console.error('Error fetching drivers:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch drivers.',
        });
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

  canAssignDriver(order: AdminOrder): boolean {
    return ['Ready'].includes(order.status) && !order.driverId;
  }

  canTrackOrder(order: AdminOrder): boolean {
    return order.driverId != null && order.driverId !== ''  && order.status !== 'Cancelled' && order.status !== 'Delivered';
  }

  showDriverAssignment(order: AdminOrder) {
    this.selectedOrderForDriver = order;
    this.selectedDriverId = '';
    this.showDriverSelection = true;
  }

  assignDriver() {
    if (!this.selectedOrderForDriver || !this.selectedDriverId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select a driver.',
      });
      return;
    }

    this.loading = true;
    this.orderService.assignDriverToOrder(this.selectedOrderForDriver.id, this.selectedDriverId).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Driver assigned successfully.',
        });
        this.showDriverSelection = false;
        this.selectedOrderForDriver = null;
        this.selectedDriverId = '';
        this.fetchOrders(); // Refresh orders to get updated driver info
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to assign driver.',
        });
        this.loading = false;
      },
    });
  }

  trackOrder(order: AdminOrder) {
    if (order.driverId) {
      this.router.navigate(['/admin/tracking'], { queryParams: { driverId: order.driverId } });
    }
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

  showStockFeatures(order: AdminOrder, event: Event) {
    this.selectedStockId = order.stockId;
    this.selectedProductName = order.productName;
    this.selectedQuantity = order.quantity;
    this.selectedPrice = order.price;
    this.selectedOrderType = order.orderType;
    this.selectedStatus = order.status;
    this.selectedDescription = order.description;
    this.op.toggle(event);
  }
}
