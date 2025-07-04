import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

@Component({
  selector: 'app-seller-service-details-page',
  templateUrl: './seller-service-details-page.component.html',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, ReactiveFormsModule, FormsModule, DropdownModule, TooltipModule]
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
    this.serviceRequestService.getSellerRequestsByServiceId(serviceId).subscribe({
      next: (requests) => {
        this.requests = requests.map((req: any) => ({ ...req, _newStatus: req.serviceStatus }));
        let pending = 0;
        this.requests.forEach((req: any, idx: number) => {
          if (req.buyerApprovalStatus === 'Approved') {
            pending++;
            this.serviceRequestUpdateService.getUpdatesByRequestId(req.id).subscribe({
              next: (updates: any) => {
                req.updates = updates;
                pending--;
                if (pending === 0) this.loading = false;
              },
              error: () => {
                req.updates = [];
                pending--;
                if (pending === 0) this.loading = false;
              }
            });
          } else {
            req.updates = [];
          }
        });
        if (pending === 0) this.loading = false;
      },
      error: () => {
        this.requests = [];
        this.loading = false;
      }
    });
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
            this.requests = requests;
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
      },
      error: () => {
        // Optionally show error
      }
    });
  }

  openUpdatesModal(request: any) {
    this.selectedUpdatesRequest = request;
    this.updatesModalVisible = true;
    // Optionally, re-fetch updates here if you want to always show latest
    // this.fetchUpdatesForRequest(request);
  }

  closeUpdatesModal() {
    this.updatesModalVisible = false;
    this.selectedUpdatesRequest = null;
  }

  openDescriptionModal(request: any) {
    this.selectedDescriptionRequest = request;
    this.descriptionModalVisible = true;
  }

  closeDescriptionModal() {
    this.descriptionModalVisible = false;
    this.selectedDescriptionRequest = null;
  }

  getPendingUpdatesCount(request: any): number {
    if (!request.updates || !Array.isArray(request.updates)) return 0;
    return request.updates.filter((u: any) => u.status === 'Pending').length;
  }

  changeRequestStatus(request: any) {
    if (!request._newStatus || request._newStatus === request.serviceStatus) return;
    this.serviceRequestService.updateRequestStatus(request.id, request._newStatus).subscribe({
      next: () => {
        request.serviceStatus = request._newStatus;
      },
      error: () => {
        // Optionally show error
        request._newStatus = request.serviceStatus;
      }
    });
  }

  getOfferAttemptsLeft(request: any): number {
    return 3 - (typeof request.sellerOfferAttempts === 'number' ? request.sellerOfferAttempts : 0);
  }

  canSetOffer(request: any): boolean {
    if (!request) return false;
    const attempts = typeof request.sellerOfferAttempts === 'number' ? request.sellerOfferAttempts : 0;
    if (request.serviceStatus === 'Cancelled') return false;
    if (attempts >= 3) return false;
    // Allow if buyer rejected and attempts left
    if (request.buyerApprovalStatus === 'Rejected' && attempts < 3) return true;
    // Allow if no offer yet and attempts left
    if ((!request.pricePerProduct || !request.estimatedTime) && attempts < 3) return true;
    // Allow if buyer has not yet responded and attempts left
    if (request.buyerApprovalStatus === 'Pending' && attempts < 3) return true;
    // Disallow if already approved
    if (request.serviceStatus === 'Approved') return false;
    return false;
  }

  getSetOfferTooltip(request: any): string {
    const attempts = typeof request.sellerOfferAttempts === 'number' ? request.sellerOfferAttempts : 0;
    if (request.serviceStatus !== 'Pending') {
      return 'Cannot set offer: Service is not pending.';
    }
    if (attempts >= 3) {
      return 'No more offer attempts allowed (max 3 reached).';
    }
    if (request.buyerApprovalStatus === 'Approved') {
      return 'Buyer has approved your offer.';
    }
    if (request.buyerApprovalStatus === 'Rejected') {
      return `Buyer rejected your last offer. Attempts left: ${3 - attempts}`;
    }
    if (request.buyerApprovalStatus === 'Pending') {
      return `Waiting for buyer response. Attempts left: ${3 - attempts}`;
    }
    return `You can set an offer up to 3 times. Attempts left: ${3 - attempts}`;
  }

  getViewUpdatesTooltip(request: any): string {
    if (!request.pricePerProduct || !request.estimatedTime) {
      return 'Set an offer and wait for buyer approval before updates are available.';
    }
    if (request.buyerApprovalStatus !== 'Approved') {
      return 'Updates are only available after buyer approves your offer.';
    }
    if (!request.updates || request.updates.length === 0) {
      return 'No updates for this request yet.';
    }
    return 'View updates for this request.';
  }

  filteredRequests(): any[] {
    let filtered = this.requests;
    if (this.searchText && this.searchText.trim() !== '') {
      const search = this.searchText.trim().toLowerCase();
      filtered = filtered.filter(req =>
        req.buyerName && req.buyerName.toLowerCase().includes(search)
      );
    }
    if (this.statusFilter) {
      filtered = filtered.filter(req => req.serviceStatus === this.statusFilter);
    }
    if (this.approvalFilter) {
      filtered = filtered.filter(req => req.buyerApprovalStatus === this.approvalFilter);
    }
    return filtered;
  }
}
