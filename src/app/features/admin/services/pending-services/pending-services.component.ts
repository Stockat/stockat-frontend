import { Component, OnInit } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ServiceService } from '../../../../core/services/service.service';
import { Service, ApprovalStatus } from '../../../../core/models/service-models/service.dto';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';

interface PaginatedDto<T> {
  page: number;
  size: number;
  count: number;
  paginatedData: T;
}

interface GenericRequestModel<T> {
  status: number;
  message: string;
  data: T;
}

@Component({
  selector: 'app-pending-services',
  templateUrl: './pending-services.component.html',
  providers: [MessageService, ConfirmationService],
  imports: [TableModule, ButtonModule, PaginatorModule, ToastModule, ConfirmDialogModule,
     ProgressSpinnerModule, TooltipModule, CommonModule, RouterModule, ToastModule, FormsModule, SliderModule],
})
export class PendingServicesComponent implements OnInit {
  pendingServices: Service[] = [];
  approvedServices: Service[] = [];
  rejectedServices: Service[] = [];
  allServices: Service[] = [];
  filteredServices: Service[] = [];
  loading = false;
  page = 1;
  size = 10;
  totalCount = 0;

  // Tab management
  selectedTab: 'pending' | 'approved' | 'rejected' = 'pending';

  // Stats
  stats = { pending: 0, approved: 0, rejected: 0 };

  // Search and filter
  searchTerm = '';
  showDeletedServices: boolean = false;
  showBlockedSellers: boolean = false;
  showDeletedSellers: boolean = false;

  // Modal state for image preview
  imageModalOpen = false;
  selectedImageUrl: string | null = null;

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private serviceService: ServiceService
  ) {}

  ngOnInit(): void {
    this.fetchAllServices();
  }

  fetchAllServices() {
    this.loading = true;
    // Fetch all services for admin without any filtering (get all, not paginated)
    this.serviceService.getAllServicesForAdmin(
      1, // page 1
      1000, // large size to get all services
      false, // Don't filter blocked sellers at backend
      false, // Don't filter deleted sellers at backend
      false  // Don't filter deleted services at backend
    ).toPromise().then((response) => {
      if (response && response.data) {
        this.allServices = response.data.paginatedData;
        this.totalCount = response.data.count;



        // Categorize services by approval status
        this.pendingServices = this.allServices.filter(s => s.isApproved === ApprovalStatus.Pending);
        this.approvedServices = this.allServices.filter(s => s.isApproved === ApprovalStatus.Approved);
        this.rejectedServices = this.allServices.filter(s => s.isApproved === ApprovalStatus.Rejected);

        this.updateStats();
        this.applyFilters();
      }
      this.loading = false;
    }).catch(() => {
      this.loading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load services.'
      });
    });
  }

  updateStats() {
    this.stats.pending = this.pendingServices.length;
    this.stats.approved = this.approvedServices.length;
    this.stats.rejected = this.rejectedServices.length;
  }



  applyFilters() {
    let currentServices: Service[];
    switch (this.selectedTab) {
      case 'pending':
        currentServices = this.pendingServices;
        break;
      case 'approved':
        currentServices = this.approvedServices;
        break;
      case 'rejected':
        currentServices = this.rejectedServices;
        break;
      default:
        currentServices = this.pendingServices;
    }



    // Apply checkbox filters locally to current tab services only
    let filtered = currentServices.filter(service => {
      // Apply deleted services filter
      const matchesDeletedFilter = this.showDeletedServices || !service.isDeleted;

      // Apply blocked sellers filter
      const matchesBlockedFilter = this.showBlockedSellers || !service.sellerIsBlocked;

      // Apply deleted sellers filter
      const matchesDeletedSellerFilter = this.showDeletedSellers || !service.sellerIsDeleted;



      return matchesDeletedFilter && matchesBlockedFilter && matchesDeletedSellerFilter;
    });



    // Apply search and other filters
    filtered = filtered.filter(service => {
      const matchesSearch = this.searchTerm.trim() === '' ||
        service.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        service.sellerName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesSearch;
    });



    // Update total count for pagination
    this.totalCount = filtered.length;

    // Apply pagination
    const startIndex = (this.page - 1) * this.size;
    this.filteredServices = filtered.slice(startIndex, startIndex + this.size);
  }

  onTabChange(tab: 'pending' | 'approved' | 'rejected') {
    this.selectedTab = tab;
    this.page = 1; // Reset to first page when changing tabs
    this.applyFilters();
  }

  onSearchTermChange() {
    this.page = 1; // Reset to first page when searching
    this.applyFilters();
  }

  onFilterChange() {
    this.page = 1; // Reset to first page when filtering
    this.applyFilters();
  }

  onPageChange(event: any) {
    this.page = event.page + 1; // PrimeNG paginator is 0-based
    this.size = event.rows;
    this.applyFilters(); // Apply filters with new pagination
  }

  acceptService(service: Service) {
    this.serviceService.approveService(service.id).subscribe({
      next: (response) => {

        // Handle different response formats
        let updatedService: Service;
        if (response && response.service) {
          updatedService = response.service;
        } else if (response && response.data) {
          updatedService = response.data;
        } else if (response && response.id) {
          updatedService = response;
        } else {
          // If no response data, create updated service manually
          updatedService = { ...service, isApproved: ApprovalStatus.Approved };
        }



        // Ensure seller name is preserved
        if (updatedService && !updatedService.sellerName && service.sellerName) {
          updatedService.sellerName = service.sellerName;
        }

        // Ensure all important properties are preserved
        if (updatedService && service.sellerName) {
          updatedService.sellerName = service.sellerName;
        }
        if (updatedService && service.sellerId) {
          updatedService.sellerId = service.sellerId;
        }



        this.messageService.add({
          severity: 'success',
          summary: 'Accepted',
          detail: `Service #${service.id} accepted.`
        });

        // Remove from pending
        this.pendingServices = this.pendingServices.filter(r => r.id !== service.id);

        // Add to approved only if we have a valid service
        if (updatedService && updatedService.id) {
          this.approvedServices = [updatedService, ...this.approvedServices];
        }

        // Update all services array
        this.allServices = this.allServices.map(s => s.id === service.id ? updatedService : s);

        this.applyFilters();
        this.updateStats();
      },
      error: (err: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || err?.error || err?.message || 'Failed to accept service.'
        });
      }
    });
  }

  rejectService(service: Service) {
    this.serviceService.rejectService(service.id).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Rejected',
          detail: `Service #${service.id} rejected.`
        });

        // Remove from pending
        this.pendingServices = this.pendingServices.filter(r => r.id !== service.id);

                // Add to rejected
        const rejectedService: Service = { ...service, isApproved: ApprovalStatus.Rejected };
        this.rejectedServices = [rejectedService, ...this.rejectedServices];

        // Update all services array
        this.allServices = this.allServices.map(s => s.id === service.id ? rejectedService : s);

        this.applyFilters();
        this.updateStats();
      },
      error: (err: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || err?.error || err?.message || 'Failed to reject service.'
        });
      }
    });
  }

  deleteService(service: Service) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete service #${service.id}? This action can be undone.`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.serviceService.deleteService(service.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: `Service #${service.id} deleted.`
            });
            // Remove from current list
            if (this.selectedTab === 'pending') {
              this.pendingServices = this.pendingServices.filter(s => s.id !== service.id);
            } else if (this.selectedTab === 'approved') {
              this.approvedServices = this.approvedServices.filter(s => s.id !== service.id);
            } else if (this.selectedTab === 'rejected') {
              this.rejectedServices = this.rejectedServices.filter(s => s.id !== service.id);
            }

            // Remove from all services array
            this.allServices = this.allServices.filter(s => s.id !== service.id);

            this.applyFilters();
            this.updateStats();
          },
          error: (err: any) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err?.error?.message || err?.error || err?.message || 'Failed to delete service.'
            });
          }
        });
      }
    });
  }

  restoreService(service: Service) {
    this.confirmationService.confirm({
      message: `Are you sure you want to restore service #${service.id}?`,
      header: 'Restore Confirmation',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.serviceService.restoreService(service.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Restored',
              detail: `Service #${service.id} restored.`
            });
            this.fetchAllServices(); // Reload to get updated list
          },
          error: (err: any) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err?.error?.message || err?.error || err?.message || 'Failed to restore service.'
            });
          }
        });
      }
    });
  }

  openImageModal(imageUrl: string) {
    this.selectedImageUrl = imageUrl;
    this.imageModalOpen = true;
  }

  closeImageModal() {
    this.imageModalOpen = false;
    this.selectedImageUrl = null;
  }
}
