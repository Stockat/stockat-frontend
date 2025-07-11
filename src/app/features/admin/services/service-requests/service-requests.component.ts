import { Component, OnInit } from '@angular/core';
import { ServiceRequestService } from '../../../../core/services/service-request.service';
import { ServiceRequestDto } from '../../../../core/models/service-models/service-request.dto';
import { PaginationDto } from '../../../../core/models/pagination-Dto';
import { GenericRequestModel } from '../../../../core/models/generic-request-Dto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { UserService } from '../../../../core/services/user.service';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-service-requests',
  templateUrl: './service-requests.component.html',
  // styleUrls: ['./service-requests.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, TabMenuModule, TableModule, BadgeModule,
     ButtonModule, InputTextModule, ToastModule, ConfirmDialogModule, PaginatorModule, DialogModule, CardModule, AvatarModule, TagModule],
  providers: [MessageService, ConfirmationService],
})
export class ServiceRequestsComponent implements OnInit {
  requests: ServiceRequestDto[] = [];
  filteredRequests: ServiceRequestDto[] = [];
  page: number = 1;
  size: number = 10;
  total: number = 0;
  loading: boolean = false;
  statusFilter: string = '';
  stats = { total: 0, ready: 0, delivered: 0 };
  searchTerm: string = '';

  activeTab: string = 'all';
  buyerModalVisible = false;
  buyerInfo: any = null;
  buyerLoading = false;
  buyerError = '';
  sellerModalVisible = false;
  sellerInfo: any = null;
  sellerLoading = false;
  sellerError = '';

  // Add for request details modal
  requestDetailsModalVisible = false;
  selectedRequest: ServiceRequestDto | null = null;

  constructor(
    public serviceRequestService: ServiceRequestService,
    private userService: UserService,
    private messageService: MessageService, // Add MessageService for notifications
    private router: Router // Add Router for navigation
  ) {}

  ngOnInit() {
    this.fetchRequests();
  }

  fetchRequests() {
    this.loading = true;
    this.serviceRequestService.getAllRequestsForAdmin(this.page, this.size, this.statusFilter).subscribe({
      next: (res: any) => {
        this.requests = res.data.paginated.paginatedData;
        this.total = res.data.paginated.count;
        this.stats = {
          total: res.data.stats.total,
          ready: res.data.stats.ready,
          delivered: res.data.stats.delivered
        };
        this.filteredRequests = this.requests;
        if (this.searchTerm) {
          this.applyFilter();
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  // Remove computeStats function

  // Update onTabChange to set statusFilter as a string and apply filter
  onTabChange(tab: string) {
    this.activeTab = tab;
    if (tab === 'all') {
      this.statusFilter = '';
    } else if (tab === 'ready') {
      this.statusFilter = '2'; // Ready
    } else if (tab === 'delivered') {
      this.statusFilter = '3'; // Delivered
    }
    this.page = 1;
    this.fetchRequests();
  }

  // Only filter by search term
  applyFilter() {
    const term = this.searchTerm.toLowerCase();
    this.filteredRequests = this.requests.filter(req =>
      (req.serviceNameSnapshot?.toLowerCase().includes(term) ||
       req.sellerName?.toLowerCase().includes(term) ||
       req.buyerName?.toLowerCase().includes(term) ||
       req.requestDescription?.toLowerCase().includes(term))
    );
  }

  markAsDelivered(request: ServiceRequestDto) {
    if (request.serviceStatus !== 'Ready') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Not Allowed',
        detail: 'Only requests with status "Ready" can be marked as delivered.'
      });
      return;
    }
    this.serviceRequestService.updateRequestStatus(request.id, 'Delivered').subscribe({
      next: () => {
        this.fetchRequests();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Service marked as delivered.'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to mark service as delivered.'
        });
      }
    });
  }

  onPageChange(event: any) {
    this.page = event.first / event.rows + 1;
    this.size = event.rows;
    this.fetchRequests();
  }

  showBuyerModal(buyerId: string) {
    this.buyerModalVisible = true;
    this.buyerInfo = null;
    this.buyerLoading = true;
    this.buyerError = '';
    this.userService.getUserById(buyerId).subscribe({
      next: (res) => {
        this.buyerInfo = res.data;
        this.buyerLoading = false;
        console.log(this.buyerInfo);
      },
      error: (err) => {
        this.buyerError = 'Failed to load buyer info.';
        this.buyerLoading = false;
      }
    });
  }

  closeBuyerModal() {
    this.buyerModalVisible = false;
    this.buyerInfo = null;
    this.buyerLoading = false;
    this.buyerError = '';
  }

  showSellerModal(sellerId: string) {
    this.sellerModalVisible = true;
    this.sellerInfo = null;
    this.sellerLoading = true;
    this.sellerError = '';
    this.userService.getUserById(sellerId).subscribe({
      next: (res) => {
        this.sellerInfo = res.data;
        this.sellerLoading = false;
      },
      error: (err) => {
        this.sellerError = 'Failed to load seller info.';
        this.sellerLoading = false;
      }
    });
  }

  closeSellerModal() {
    this.sellerModalVisible = false;
    this.sellerInfo = null;
    this.sellerLoading = false;
    this.sellerError = '';
  }

  // Add for request details modal
  showRequestDetails(request: ServiceRequestDto) {
    this.selectedRequest = request;
    this.requestDetailsModalVisible = true;
  }

  closeRequestDetailsModal() {
    this.requestDetailsModalVisible = false;
    this.selectedRequest = null;
  }

  contactSeller(sellerInfo: any) {
    // This could open a chat modal or redirect to chat
    this.router.navigate(['/chat', sellerInfo.id]); // Navigate to chat with the seller's ID
  }

  contactBuyer(buyerInfo: any) {
    // This could open a chat modal or redirect to chat
    this.router.navigate(['/chat', buyerInfo.id]); // Navigate to chat with the buyer's ID
  }
}
