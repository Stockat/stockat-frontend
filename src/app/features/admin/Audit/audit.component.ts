import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { AuditService } from '../../../core/services/audit.service';
import {
  AuditDto,
  AuditRecord,
} from '../../../core/models/audit-models/audit.dto';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    ProgressSpinnerModule,
    ToastModule,
    CalendarModule,
    InputTextModule,
    DropdownModule,
  ],
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.css'],
  providers: [MessageService],
})
export class AuditComponent implements OnInit {
  auditData: AuditDto[] = [];
  filteredAuditData: AuditDto[] = [];
  loading = false;
  showDetailsDialog = false;
  selectedAudit: AuditDto | null = null;
  oldRecord: AuditRecord | null = null;
  newRecord: AuditRecord | null = null;

  // Filter properties
  orderIdFilter: string = '';
  userIdFilter: string = '';
  startDate: Date | null = null;
  endDate: Date | null = null;
  showFilters = false;

  // Time filter options
  timeFilterOptions = [
    { label: 'Last Hour', value: '1h' },
    { label: 'Last 6 Hours', value: '6h' },
    { label: 'Last 24 Hours', value: '24h' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Custom Range', value: 'custom' },
  ];
  selectedTimeFilter: string = '';

  constructor(
    private auditService: AuditService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadAuditData();
  }

  loadAuditData() {
    this.loading = true;
    this.auditService.getAuditData().subscribe({
      next: (data) => {
        console.log('Audit data received:', data);
        if (Array.isArray(data)) {
          this.auditData = data;
          this.applyFilters();
        } else {
          console.error('Expected array but received:', typeof data, data);
          this.auditData = [];
          this.filteredAuditData = [];
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Invalid data format received from server',
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading audit data:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load audit data',
        });
        this.loading = false;
      },
    });
  }

  viewDetails(audit: AuditDto) {
    this.selectedAudit = audit;
    try {
      this.oldRecord = JSON.parse(audit.oldRecordJson);
      this.newRecord = JSON.parse(audit.newRecordJson);
      this.showDetailsDialog = true;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to parse audit record data',
      });
    }
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 0:
        return 'Pending Seller';
      case 1:
        return 'Pending Buyer';
      case 2:
        return 'Processing';
      case 3:
        return 'Ready';
      case 4:
        return 'Pending';
      case 5:
        return 'Shipped';
      case 6:
        return 'Completed';
      case 7:
        return 'Cancelled';
      case 8:
        return 'Payment Failed';
      case 9:
        return 'Delivered';
      case 10:
        return 'Paid';
      default:
        return 'Unknown';
    }
  }

  getStatusSeverity(status: number): string {
    switch (status) {
      case 0: // PendingSeller
        return 'warning';
      case 1: // PendingBuyer
        return 'warning';
      case 2: // Processing
        return 'info';
      case 3: // Ready
        return 'primary';
      case 4: // Pending
        return 'warning';
      case 5: // Shipped
        return 'primary';
      case 6: // Completed
        return 'success';
      case 7: // Cancelled
        return 'danger';
      case 8: // PaymentFailed
        return 'danger';
      case 9: // Delivered
        return 'success';
      case 10: // Payed
        return 'success';
      default:
        return 'secondary';
    }
  }

  getPaymentStatusLabel(status: number): string {
    switch (status) {
      case 0:
        return 'Pending';
      case 1:
        return 'Paid';
      case 2:
        return 'Failed';
      case 3:
        return 'Refunded';
      default:
        return 'Unknown';
    }
  }

  getPaymentStatusSeverity(status: number): string {
    switch (status) {
      case 0:
        return 'warning';
      case 1:
        return 'success';
      case 2:
        return 'danger';
      case 3:
        return 'info';
      default:
        return 'secondary';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  getChangedFields(): { field: string; oldValue: any; newValue: any }[] {
    if (!this.oldRecord || !this.newRecord) return [];

    const changes: { field: string; oldValue: any; newValue: any }[] = [];
    const oldKeys = Object.keys(this.oldRecord);
    const newKeys = Object.keys(this.newRecord);

    // Check all keys from both objects
    const allKeys = [...new Set([...oldKeys, ...newKeys])];

    allKeys.forEach((key) => {
      const oldValue = this.oldRecord?.[key as keyof AuditRecord];
      const newValue = this.newRecord?.[key as keyof AuditRecord];

      if (oldValue !== newValue) {
        changes.push({
          field: key,
          oldValue: oldValue,
          newValue: newValue,
        });
      }
    });

    return changes;
  }

  formatValue(value: any, fieldName?: string): string {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') {
      // Handle status and payment status fields specifically
      if (fieldName === 'Status') {
        return this.getStatusLabel(value);
      }
      if (fieldName === 'PaymentStatus') {
        return this.getPaymentStatusLabel(value);
      }
      return value.toString();
    }
    if (typeof value === 'string') {
      // Try to parse as date
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString();
      }
      return value;
    }
    return JSON.stringify(value);
  }

  // Filter methods
  applyFilters() {
    this.filteredAuditData = this.auditData.filter((audit) => {
      // Filter by order ID
      if (
        this.orderIdFilter &&
        !audit.orderProductId.toString().includes(this.orderIdFilter)
      ) {
        return false;
      }

      // Filter by user ID
      if (
        this.userIdFilter &&
        !audit.userId.toLowerCase().includes(this.userIdFilter.toLowerCase())
      ) {
        return false;
      }

      // Filter by date range
      if (this.startDate || this.endDate) {
        const auditDate = new Date(audit.changedAt);

        if (this.startDate && auditDate < this.startDate) {
          return false;
        }

        if (this.endDate) {
          const endDateWithTime = new Date(this.endDate);
          endDateWithTime.setHours(23, 59, 59, 999); // Set to end of day
          if (auditDate > endDateWithTime) {
            return false;
          }
        }
      }

      return true;
    });
  }

  clearFilters() {
    this.orderIdFilter = '';
    this.userIdFilter = '';
    this.startDate = null;
    this.endDate = null;
    this.selectedTimeFilter = '';
    this.applyFilters();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  onFilterChange() {
    this.applyFilters();
  }

  onTimeFilterChange() {
    if (this.selectedTimeFilter && this.selectedTimeFilter !== 'custom') {
      const now = new Date();
      this.endDate = now;

      switch (this.selectedTimeFilter) {
        case '1h':
          this.startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '6h':
          this.startDate = new Date(now.getTime() - 6 * 60 * 60 * 1000);
          break;
        case '24h':
          this.startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          this.startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          this.startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'custom':
          this.startDate = null;
          this.endDate = null;
          break;
      }

      this.applyFilters();
    }
  }

  clearTimeFilter() {
    this.selectedTimeFilter = '';
    this.startDate = null;
    this.endDate = null;
    this.applyFilters();
  }

  formatTimeRange(): string {
    if (!this.startDate && !this.endDate) return 'All Time';

    const start = this.startDate
      ? this.formatDate(this.startDate.toISOString())
      : 'Any';
    const end = this.endDate
      ? this.formatDate(this.endDate.toISOString())
      : 'Now';

    return `${start} - ${end}`;
  }
}
