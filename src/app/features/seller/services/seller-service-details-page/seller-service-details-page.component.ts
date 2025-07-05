import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService } from '../../../../core/services/service.service';
import { ServiceRequestService } from '../../../../core/services/service-request.service';
import { ServiceRequestUpdateService } from '../../../../core/services/service-request-update.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-seller-service-details-page',
  templateUrl: './seller-service-details-page.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    ReactiveFormsModule,
    FormsModule,
    DropdownModule,
    TooltipModule,
    TagModule,
    ProgressSpinnerModule
  ]
})
export class SellerServiceDetailsPageComponent implements OnInit {
  service: any = null;
  requests: any[] = [];
  loading = true;
  offerModalVisible = false;
  selectedRequest: any = null;
  offerForm: FormGroup;
  offerLoading = false;
  offerError = '';
  offerSuccess = '';

  // For status dropdown
  requestStatusOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'InProgress', value: 'InProgress' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Cancelled', value: 'Cancelled' }
  ];

  // Updates modal state
  updatesModalVisible = false;
  selectedUpdatesRequest: any = null;

  // Description modal state
  descriptionModalVisible = false;
  selectedDescriptionRequest: any = null;

  // Request Details modal state
  requestDetailsModalVisible = false;
  selectedRequestDetails: any = null;

  // Description display state
  showFullDescription = false;

  // Search and filter state
  searchText: string = '';
  statusFilter: string | null = null;
  approvalFilter: string | null = null;
  statusFilterOptions = [
    { label: 'All', value: null },
    { label: 'Pending', value: 'Pending' },
    { label: 'InProgress', value: 'InProgress' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Cancelled', value: 'Cancelled' }
  ];
  approvalFilterOptions = [
    { label: 'All', value: null },
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serviceService: ServiceService,
    private serviceRequestService: ServiceRequestService,
    private serviceRequestUpdateService: ServiceRequestUpdateService,
    private fb: FormBuilder
  ) {
    this.offerForm = this.fb.group({
      pricePerProduct: [null, [Validators.required, Validators.min(1)]],
      estimatedTime: ['', Validators.required]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.serviceService.getServiceById(+id).subscribe({
        next: (service) => {
          this.service = service;
        },
        error: () => {
          this.service = null;
        }
      });
      this.fetchRequestsWithUpdates(+id);
    }
  }

  fetchRequestsWithUpdates(serviceId: number) {
    console.log('Fetching requests for service:', serviceId);
    this.serviceRequestService.getSellerRequestsByServiceId(serviceId).subscribe({
      next: (requests) => {
        console.log('Received requests:', requests);
        if (requests && requests.data && requests.data.paginatedData) {
          this.requests = requests.data.paginatedData.map((req: any) => ({ ...req, _newStatus: req.serviceStatus }));
          console.log('Processed requests:', this.requests);

          // Initialize updates for all requests
          this.requests.forEach((req: any) => {
            req.updates = [];
            req._newStatus = req.serviceStatus; // Ensure status is initialized
          });

          // Load updates for approved requests
          const approvedRequests = this.requests.filter(req => req.buyerApprovalStatus === 'Approved');
          if (approvedRequests.length === 0) {
            this.loading = false;
            return;
          }

          let pendingUpdates = approvedRequests.length;
          approvedRequests.forEach((req: any) => {
            this.serviceRequestUpdateService.getUpdatesByRequestId(req.id).subscribe({
              next: (updates: any) => {
                console.log('Updates for request', req.id, ':', updates);
                // Handle different response formats
                if (updates && updates.data && updates.data.paginatedData) {
                  req.updates = updates.data.paginatedData;
                } else if (Array.isArray(updates)) {
                  req.updates = updates;
                } else {
                  req.updates = [];
                }
                console.log('Processed updates for request', req.id, ':', req.updates);
                pendingUpdates--;
                if (pendingUpdates === 0) {
                  this.loading = false;
                  console.log('All updates loaded, loading complete');
                }
              },
              error: (error) => {
                console.error('Error loading updates for request:', req.id, error);
                req.updates = [];
                pendingUpdates--;
                if (pendingUpdates === 0) {
                  this.loading = false;
                  console.log('All updates loaded (with errors), loading complete');
                }
              }
            });
          });
        } else {
          console.log('No requests data found');
          this.requests = [];
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error fetching requests:', error);
        this.requests = [];
        this.loading = false;
      }
    });
  }

  // Helper methods for UI stats
  getPendingRequestsCount(): number {
    return this.requests.filter(req => req.serviceStatus === 'Pending').length;
  }

  getApprovedRequestsCount(): number {
    return this.requests.filter(req => req.buyerApprovalStatus === 'Approved').length;
  }

  getOffersMadeCount(): number {
    return this.requests.filter(req => req.pricePerProduct != null && req.pricePerProduct !== 0).length;
  }

  // Status severity methods for PrimeNG tags
  getStatusSeverity(status: string): string {
    switch (status) {
      case 'Pending': return 'warning';
      case 'InProgress': return 'info';
      case 'Delivered': return 'success';
      case 'Cancelled': return 'danger';
      default: return 'secondary';
    }
  }

  getApprovalSeverity(status: string): string {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Approved': return 'success';
      case 'Rejected': return 'danger';
      default: return 'secondary';
    }
  }

  getUpdateStatusSeverity(status: string): string {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Approved': return 'success';
      case 'Rejected': return 'danger';
      default: return 'secondary';
    }
  }

  openOfferModal(request: any) {
    this.selectedRequest = request;
    this.offerForm.reset();
    this.offerError = '';
    this.offerSuccess = '';
    this.offerModalVisible = true;
  }

  closeOfferModal() {
    this.offerModalVisible = false;
    this.selectedRequest = null;
  }

  submitOffer() {
    if (this.offerForm.invalid || !this.selectedRequest) return;
    this.offerLoading = true;
    this.offerError = '';
    this.offerSuccess = '';
    const offer = this.offerForm.value;
    this.serviceRequestService.setSellerOffer(this.selectedRequest.id, offer).subscribe({
      next: () => {
        this.offerSuccess = 'Offer sent successfully!';
        // Refresh requests to show updated offer immediately
        this.serviceRequestService.getSellerRequestsByServiceId(this.service.id).subscribe({
          next: (requests) => {
            this.requests = requests.data.paginatedData;
            this.offerLoading = false;
            setTimeout(() => {
              this.closeOfferModal();
            }, 1000);
          },
          error: () => {
            this.offerLoading = false;
            setTimeout(() => {
              this.closeOfferModal();
            }, 1000);
          }
        });
      },
      error: (err) => {
        this.offerError = 'Failed to send offer.';
        this.offerLoading = false;
      }
    });
  }

  acceptUpdate(update: any) {
    this.serviceRequestUpdateService.approveUpdate(update.id, true).subscribe({
      next: () => {
        update.status = 'Approved';
        // Refresh the updates list to update pending count
        if (this.selectedUpdatesRequest) {
          this.serviceRequestUpdateService.getUpdatesByRequestId(this.selectedUpdatesRequest.id).subscribe({
            next: (updates: any) => {
              console.log('Updates response after accept:', updates);
              this.selectedUpdatesRequest.updates = updates?.data?.paginatedData || [];
            }
          });
        }
      },
      error: () => {
        // Optionally show error
      }
    });
  }

  rejectUpdate(update: any) {
    this.serviceRequestUpdateService.approveUpdate(update.id, false).subscribe({
      next: () => {
        update.status = 'Rejected';
        // Refresh the updates list to update pending count
        if (this.selectedUpdatesRequest) {
          this.serviceRequestUpdateService.getUpdatesByRequestId(this.selectedUpdatesRequest.id).subscribe({
            next: (updates: any) => {
              console.log('Updates response after reject:', updates);
              this.selectedUpdatesRequest.updates = updates?.data?.paginatedData || [];
            }
          });
        }
      },
      error: () => {
        // Optionally show error
      }
    });
  }

  openUpdatesModal(request: any) {
    this.selectedUpdatesRequest = request;
    this.updatesModalVisible = true;

    // Set loading state and fetch updates
    this.selectedUpdatesRequest.updatesLoading = true;
    this.serviceRequestUpdateService.getUpdatesByRequestId(request.id).subscribe({
      next: (updates: any) => {
        console.log('Updates response in modal:', updates);
        this.selectedUpdatesRequest.updates = updates?.data?.paginatedData || [];
        this.selectedUpdatesRequest.updatesLoading = false;
      },
      error: (error) => {
        console.error('Error loading updates for request:', request.id, error);
        this.selectedUpdatesRequest.updates = [];
        this.selectedUpdatesRequest.updatesLoading = false;
      }
    });
  }

  closeUpdatesModal() {
    this.updatesModalVisible = false;
    this.selectedUpdatesRequest = null;
    // Refresh the updates for all requests to update badges
    this.refreshAllUpdates();
  }

  refreshAllUpdates() {
    // Refresh updates for all approved requests to update badges
    const approvedRequests = this.requests.filter(req => req.buyerApprovalStatus === 'Approved');
    approvedRequests.forEach((req: any) => {
      this.serviceRequestUpdateService.getUpdatesByRequestId(req.id).subscribe({
        next: (updates: any) => {
          if (updates && updates.data && updates.data.paginatedData) {
            req.updates = updates.data.paginatedData;
          } else if (Array.isArray(updates)) {
            req.updates = updates;
          } else {
            req.updates = [];
          }
        },
        error: (error) => {
          console.error('Error refreshing updates for request:', req.id, error);
          req.updates = [];
        }
      });
    });
  }

  openDescriptionModal(request: any) {
    this.selectedDescriptionRequest = request;
    this.descriptionModalVisible = true;
  }

  openServiceDescriptionModal() {
    this.descriptionModalVisible = true;
  }

  closeDescriptionModal() {
    this.descriptionModalVisible = false;
    this.selectedDescriptionRequest = null;
  }

  openRequestDetailsModal(request: any) {
    this.selectedRequestDetails = request;
    this.requestDetailsModalVisible = true;
  }

  closeRequestDetailsModal() {
    this.requestDetailsModalVisible = false;
    this.selectedRequestDetails = null;
  }

  getPendingUpdatesCount(request: any): number {
    console.log('Getting pending updates count for request:', request.id);
    console.log('Request updates:', request.updates);
    if (!request || !request.updates || !Array.isArray(request.updates)) {
      console.log('No updates array found, returning 0');
      return 0;
    }
    const pendingCount = request.updates.filter((update: any) => update.status === 'Pending').length;
    console.log('Pending updates count:', pendingCount);
    return pendingCount;
  }

  getApprovedUpdatesCount(request: any): number {
    if (!request || !request.updates || !Array.isArray(request.updates)) {
      return 0;
    }
    return request.updates.filter((update: any) => update.status === 'Approved').length;
  }

  getRejectedUpdatesCount(request: any): number {
    if (!request || !request.updates || !Array.isArray(request.updates)) {
      return 0;
    }
    return request.updates.filter((update: any) => update.status === 'Rejected').length;
  }

  changeRequestStatus(request: any) {
    if (!request._newStatus || request._newStatus === request.serviceStatus) return;

    this.serviceRequestService.updateRequestStatus(request.id, request._newStatus).subscribe({
      next: () => {
        request.serviceStatus = request._newStatus;
        // Optionally show success message
      },
      error: () => {
        // Optionally show error message
        request._newStatus = request.serviceStatus; // Reset to original
      }
    });
  }

  getOfferAttemptsLeft(request: any): number {
    return Math.max(0, 3 - (request.offerAttempts || 0));
  }

  canSetOffer(request: any): boolean {
    // Can set offer if:
    // 1. No offer has been made yet (pricePerProduct is null or 0)
    // 2. Buyer approval status is not 'Rejected'
    // 3. Service status is not 'Cancelled'
    return (
      (request.pricePerProduct == null || request.pricePerProduct === 0) &&
      request.buyerApprovalStatus !== 'Rejected' &&
      request.serviceStatus !== 'Cancelled'
    );
  }

  getSetOfferTooltip(request: any): string {
    if (request.buyerApprovalStatus === 'Rejected') {
      return 'Cannot set offer for rejected requests';
    }
    if (request.serviceStatus === 'Cancelled') {
      return 'Cannot set offer for cancelled services';
    }
    if (request.pricePerProduct != null && request.pricePerProduct !== 0) {
      return 'Offer already set for this request';
    }
    return 'Set your offer for this request';
  }

  getViewUpdatesTooltip(request: any): string {
    if (!request) {
      return 'View request updates';
    }
    if (request.buyerApprovalStatus !== 'Approved') {
      return 'Updates only available for approved requests';
    }
    const pendingCount = this.getPendingUpdatesCount(request);
    if (pendingCount > 0) {
      return `${pendingCount} pending update(s)`;
    }
    return 'View request updates';
  }

    filteredRequests(): any[] {
    console.log('Filtering requests. Total:', this.requests?.length || 0);
    let filtered = this.requests || [];

    // Apply search filter
    if (this.searchText.trim()) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(request =>
        request.buyerName && request.buyerName.toLowerCase().includes(searchLower)
      );
      console.log('After search filter:', filtered.length);
    }

    // Apply status filter
    if (this.statusFilter) {
      filtered = filtered.filter(request => request.serviceStatus === this.statusFilter);
      console.log('After status filter:', filtered.length);
    }

    // Apply approval filter
    if (this.approvalFilter) {
      filtered = filtered.filter(request => request.buyerApprovalStatus === this.approvalFilter);
      console.log('After approval filter:', filtered.length);
    }

    console.log('Final filtered count:', filtered.length);
    return filtered;
  }

  goBack() {
    this.router.navigate(['/seller/services']);
  }
}
