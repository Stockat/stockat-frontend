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
import { ServiceEditRequestService } from '../../../../core/services/service-edit-request.service';
import { ServiceEditRequestDto } from '../../../../core/models/service-models/service-edit-request.dto';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

import { DialogModule } from 'primeng/dialog';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { Observable } from 'rxjs';

interface PaginatedDto<T> {
  page: number;
  size: number;
  count: number;
  paginatedData: T;
}

interface GenericResponseDto<T> {
  status: number;
  message: string;
  data: T;
}

@Component({
  selector: 'app-service-edit-requests',
  templateUrl: './service-edit-requests.component.html',
  styleUrls: ['./service-edit-requests.component.css'],
  providers: [MessageService, ConfirmationService],
  imports: [
    TableModule, ButtonModule, PaginatorModule, ToastModule, ConfirmDialogModule,
    ProgressSpinnerModule, TooltipModule, CommonModule, RouterModule, FormsModule,
    InputTextModule, DialogModule
  ],
})
export class ServiceEditRequestsComponent implements OnInit {
  editRequests: ServiceEditRequestDto[] = [];
  approvedRequests: ServiceEditRequestDto[] = [];
  rejectedRequests: ServiceEditRequestDto[] = [];
  allRequests: ServiceEditRequestDto[] = [];
  filteredRequests: ServiceEditRequestDto[] = [];
  loading = false;
  page = 1;
  size = 10;
  totalCount = 0;

  // Tab management
  selectedTab: 'pending' | 'approved' | 'rejected' = 'pending';

  // Search and filter
  searchTerm = '';

  // Bulk selection
  selectedRequests: ServiceEditRequestDto[] = [];

  // Modal state for image preview
  imageModalOpen = false;
  selectedImageUrl: string | null = null;
  imageLoading = false;
  imageError = false;

  // Reject modal state
  rejectModalVisible = false;
  selectedRequestForRejection: ServiceEditRequestDto | null = null;
  rejectionNote = '';
  showRejectionError = false;

  // Details modal state
  detailsModalVisible = false;
  selectedRequestForDetails: ServiceEditRequestDto | null = null;

  // Computed properties for change status
  get nameChangeStatus() {
    if (!this.selectedRequestForDetails) return null;
    return this.getFieldChangeStatus(this.selectedRequestForDetails.currentName, this.selectedRequestForDetails.editedName);
  }

  get descriptionChangeStatus() {
    if (!this.selectedRequestForDetails) return null;
    return this.getFieldChangeStatus(this.selectedRequestForDetails.currentDescription, this.selectedRequestForDetails.editedDescription);
  }

  get priceChangeStatus() {
    if (!this.selectedRequestForDetails) return null;
    return this.getFieldChangeStatus(this.selectedRequestForDetails.currentPricePerProduct, this.selectedRequestForDetails.editedPricePerProduct);
  }

  get minQuantityChangeStatus() {
    if (!this.selectedRequestForDetails) return null;
    return this.getFieldChangeStatus(this.selectedRequestForDetails.currentMinQuantity, this.selectedRequestForDetails.editedMinQuantity);
  }

  get estimatedTimeChangeStatus() {
    if (!this.selectedRequestForDetails) return null;
    return this.getFieldChangeStatus(this.selectedRequestForDetails.currentEstimatedTime, this.selectedRequestForDetails.editedEstimatedTime);
  }

  // Stats
  stats = { pending: 0, approved: 0, rejected: 0 };

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private serviceEditRequestService: ServiceEditRequestService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.fetchStatistics();
    this.fetchEditRequests();
  }

  fetchStatistics() {
    console.log('Fetching statistics...');
    this.serviceEditRequestService.getStatistics().subscribe({
      next: (response) => {
        console.log('Statistics response:', response);
        if (response && response.data) {
          console.log('Statistics data:', response.data);
          this.stats.pending = response.data.pending || 0;
          this.stats.approved = response.data.approved || 0;
          this.stats.rejected = response.data.rejected || 0;
          console.log('Updated stats object:', this.stats);
          console.log('Stats values - pending:', this.stats.pending, 'approved:', this.stats.approved, 'rejected:', this.stats.rejected);
        } else {
          console.warn('No data in statistics response, setting defaults to 0');
          this.stats.pending = 0;
          this.stats.approved = 0;
          this.stats.rejected = 0;
        }
      },
      error: (error) => {
        console.error('Statistics error:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        const errorMessage = this.errorHandler.extractErrorMessage(error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to load statistics: ${errorMessage}`
        });
        // Set default values on error
        this.stats.pending = 0;
        this.stats.approved = 0;
        this.stats.rejected = 0;
      }
    });
  }

  fetchEditRequests() {
    this.loading = true;

    // Fetch all requests based on selected tab
    let request$: Observable<GenericResponseDto<PaginatedDto<ServiceEditRequestDto[]>>>;

    switch (this.selectedTab) {
      case 'pending':
        request$ = this.serviceEditRequestService.getPendingRequests(this.page, this.size);
        break;
      case 'approved':
        request$ = this.serviceEditRequestService.getApprovedRequests(this.page, this.size);
        break;
      case 'rejected':
        request$ = this.serviceEditRequestService.getRejectedRequests(this.page, this.size);
        break;
      default:
        request$ = this.serviceEditRequestService.getPendingRequests(this.page, this.size);
    }

    request$.subscribe({
      next: (response) => {
        if (response && response.data && response.data.paginatedData) {
          this.editRequests = response.data.paginatedData;
          this.totalCount = response.data.count;
          this.updateStats();
          this.applyFilters();
        }
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        const errorMessage = this.errorHandler.extractErrorMessage(error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
      }
    });
  }

  updateStats() {
    // Statistics are now fetched separately via fetchStatistics()
    // This method is kept for compatibility but doesn't override the stats
  }

  onTabChange(tab: 'pending' | 'approved' | 'rejected') {
    this.selectedTab = tab;
    this.page = 1; // Reset to first page when changing tabs
    this.selectedRequests = []; // Clear selections when changing tabs
    this.fetchEditRequests();
  }

  applyFilters() {
    let filtered = [...this.editRequests];

    // Apply search filter
    if (this.searchTerm && this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(request =>
        request.editedName.toLowerCase().includes(searchLower) ||
        request.editedDescription.toLowerCase().includes(searchLower)
      );
    }

    this.totalCount = filtered.length;
    this.filteredRequests = filtered;
  }

  onSearchTermChange() {
    this.page = 1; // Reset to first page when searching
    this.applyFilters();
  }

  onPageChange(event: any) {
    this.page = event.page + 1; // PrimeNG paginator is 0-based
    this.size = event.rows;
    this.fetchEditRequests(); // Reload data with new pagination
  }

  approveRequest(request: ServiceEditRequestDto) {
    if (this.selectedTab !== 'pending') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Only pending requests can be approved.'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to approve the edit request for service #${request.serviceId}?`,
      header: 'Approve Confirmation',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.serviceEditRequestService.approveRequest(request.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Approved',
              detail: `Edit request #${request.id} approved successfully.`
            });
            // Close the details modal if it's open
            if (this.detailsModalVisible) {
              this.closeDetailsModal();
            }
            this.fetchStatistics(); // Refresh statistics
            this.fetchEditRequests(); // Reload to get updated list
          },
          error: (error) => {
            const errorMessage = this.errorHandler.extractErrorMessage(error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: errorMessage
            });
          }
        });
      }
    });
  }

  rejectRequest(request: ServiceEditRequestDto) {
    if (this.selectedTab !== 'pending') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Only pending requests can be rejected.'
      });
      return;
    }

    this.selectedRequestForRejection = request;
    this.rejectModalVisible = true;
    this.rejectionNote = '';
    this.showRejectionError = false;
  }

  confirmRejection() {
    if (!this.selectedRequestForRejection) return;

    if (!this.rejectionNote.trim()) {
      this.showRejectionError = true;
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please provide a reason for rejection.'
      });
      return;
    }

    this.showRejectionError = false;
    this.serviceEditRequestService.rejectRequest(this.selectedRequestForRejection.id, this.rejectionNote).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Rejected',
          detail: `Edit request #${this.selectedRequestForRejection!.id} rejected.`
        });
        this.rejectModalVisible = false;
        this.selectedRequestForRejection = null;
        this.rejectionNote = '';
        this.showRejectionError = false;
        // Close the details modal if it's open
        if (this.detailsModalVisible) {
          this.closeDetailsModal();
        }
        this.fetchStatistics(); // Refresh statistics
        this.fetchEditRequests(); // Reload to get updated list
      },
      error: (error) => {
        const errorMessage = this.errorHandler.extractErrorMessage(error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
      }
    });
  }

  cancelRejection() {
    this.rejectModalVisible = false;
    this.selectedRequestForRejection = null;
    this.rejectionNote = '';
    this.showRejectionError = false;
  }

  openImageModal(imageUrl: string) {
    this.selectedImageUrl = imageUrl;
    this.imageModalOpen = true;
    this.imageLoading = true;
    this.imageError = false;
  }

  openImageInNewTab(imageUrl: string) {
    window.open(imageUrl, '_blank');
  }

  closeImageModal() {
    this.imageModalOpen = false;
    this.selectedImageUrl = null;
    this.imageLoading = false;
    this.imageError = false;
  }

  viewDetails(request: ServiceEditRequestDto) {
    this.selectedRequestForDetails = request;
    console.log('Viewing details for request:', request);
    console.log('Current image URL:', request.currentImageUrl);
    console.log('Edited image URL:', request.editedImageUrl);
    this.detailsModalVisible = true;
  }

  closeDetailsModal() {
    this.detailsModalVisible = false;
    this.selectedRequestForDetails = null;
  }

  onImageError(event: any) {
    console.error('Image failed to load:', event.target.src);
    this.imageLoading = false;
    this.imageError = true;
  }

  onImageLoad(event: any) {
    console.log('Image loaded successfully:', event.target.src);
    this.imageLoading = false;
    this.imageError = false;
  }

  onDetailsImageLoad(event: any) {
    console.log('Details image loaded successfully:', event.target.src);
    // Show image and hide fallback when image loads successfully
    event.target.style.display = 'block';
    const container = event.target.parentElement;
    if (container) {
      const fallback = container.querySelector('.image-fallback');
      if (fallback) {
        fallback.style.display = 'none';
        fallback.classList.add('hidden');
      }
    }
  }

  onDetailsImageError(event: any) {
    console.error('Details image failed to load:', event.target.src);
    console.error('Image error details:', event);
    // Hide image and show fallback when image fails to load
    event.target.style.display = 'none';
    const container = event.target.parentElement;
    if (container) {
      const fallback = container.querySelector('.image-fallback');
      if (fallback) {
        fallback.style.display = 'flex';
        fallback.classList.remove('hidden');
      }
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Helper methods to detect changes
  isFieldChanged(currentValue: any, editedValue: any): boolean {
    if (currentValue === null || currentValue === undefined) {
      return editedValue !== null && editedValue !== undefined;
    }
    if (editedValue === null || editedValue === undefined) {
      return currentValue !== null && currentValue !== undefined;
    }
    return currentValue.toString() !== editedValue.toString();
  }

  getFieldChangeStatus(currentValue: any, editedValue: any): { changed: boolean; type: string; icon: string; class: string } {
    const changed = this.isFieldChanged(currentValue, editedValue);

    if (!changed) {
      return {
        changed: false,
        type: 'Unchanged',
        icon: 'pi pi-minus',
        class: 'bg-gray-100 text-gray-800'
      };
    }

    // For numeric values, determine if it's increased or decreased
    if (typeof currentValue === 'number' && typeof editedValue === 'number') {
      if (editedValue > currentValue) {
        return {
          changed: true,
          type: 'Increased',
          icon: 'pi pi-arrow-up',
          class: 'bg-green-100 text-green-800'
        };
      } else if (editedValue < currentValue) {
        return {
          changed: true,
          type: 'Decreased',
          icon: 'pi pi-arrow-down',
          class: 'bg-orange-100 text-orange-800'
        };
      }
    }

    // For string values or other types
    return {
      changed: true,
      type: 'Changed',
      icon: 'pi pi-arrow-right',
      class: 'bg-blue-100 text-blue-800'
    };
  }

  isImageChanged(): boolean {
    if (!this.selectedRequestForDetails) return false;
    const current = this.selectedRequestForDetails.currentImageUrl;
    const edited = this.selectedRequestForDetails.editedImageUrl;
    return this.isFieldChanged(current, edited);
  }

  // Bulk action methods
  approveSelectedRequests() {
    if (this.selectedTab !== 'pending') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Only pending requests can be approved.'
      });
      return;
    }

    if (this.selectedRequests.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select at least one request to approve.'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to approve ${this.selectedRequests.length} edit request(s)?`,
      header: 'Bulk Approve Confirmation',
      icon: 'pi pi-question-circle',
      accept: () => {
        const approvePromises = this.selectedRequests.map(request =>
          this.serviceEditRequestService.approveRequest(request.id).toPromise()
        );

        Promise.all(approvePromises)
          .then(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Bulk Approved',
              detail: `${this.selectedRequests.length} edit request(s) approved successfully.`
            });
            this.selectedRequests = [];
            this.fetchStatistics(); // Refresh statistics
            this.fetchEditRequests();
          })
          .catch((error) => {
            const errorMessage = this.errorHandler.extractErrorMessage(error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: errorMessage
            });
          });
      }
    });
  }

  rejectSelectedRequests() {
    if (this.selectedTab !== 'pending') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Only pending requests can be rejected.'
      });
      return;
    }

    if (this.selectedRequests.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select at least one request to reject.'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to reject ${this.selectedRequests.length} edit request(s)? This action will require a rejection note.`,
      header: 'Bulk Reject Confirmation',
      icon: 'pi pi-question-circle',
      accept: () => {
        // For bulk rejection, we'll use a default note
        const defaultNote = 'Bulk rejected by admin';
        const rejectPromises = this.selectedRequests.map(request =>
          this.serviceEditRequestService.rejectRequest(request.id, defaultNote).toPromise()
        );

        Promise.all(rejectPromises)
          .then(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Bulk Rejected',
              detail: `${this.selectedRequests.length} edit request(s) rejected successfully.`
            });
            this.selectedRequests = [];
            this.fetchStatistics(); // Refresh statistics
            this.fetchEditRequests();
          })
          .catch((error) => {
            const errorMessage = this.errorHandler.extractErrorMessage(error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: errorMessage
            });
          });
      }
    });
  }

  // Test method for deferred edits
  testDeferredEdits() {
    // Prompt for service ID
    const serviceId = prompt('Enter Service ID to test deferred edits:');
    if (!serviceId) return;

    const serviceIdNum = parseInt(serviceId);
    if (isNaN(serviceIdNum)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter a valid service ID.'
      });
      return;
    }

    // First check the status
    this.serviceEditRequestService.getDeferredEditStatus(serviceIdNum).subscribe({
      next: (response) => {
        console.log('Deferred edit status:', response);
        this.messageService.add({
          severity: 'info',
          summary: 'Deferred Edit Status',
          detail: `Has deferred edits: ${response.data.hasDeferredEdits}, Active requests: ${response.data.activeRequestCount}`
        });

        // If there are deferred edits and no active requests, apply them
        if (response.data.canApplyEdits) {
          this.confirmationService.confirm({
            message: `Apply deferred edits for service ${serviceId}?`,
            header: 'Apply Deferred Edits',
            icon: 'pi pi-question-circle',
            accept: () => {
              this.serviceEditRequestService.applyDeferredEdits(serviceIdNum).subscribe({
                next: () => {
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Deferred edits applied successfully!'
                  });
                },
                error: (error) => {
                  const errorMessage = this.errorHandler.extractErrorMessage(error);
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: errorMessage
                  });
                }
              });
            }
          });
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Cannot Apply',
            detail: 'No deferred edits to apply or there are still active requests.'
          });
        }
      },
      error: (error) => {
        const errorMessage = this.errorHandler.extractErrorMessage(error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
      }
    });
  }
}
