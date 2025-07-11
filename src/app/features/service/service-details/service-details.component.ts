import { Component } from '@angular/core';
import { Service } from '../../../core/models/service-models/service.dto';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ServiceService } from '../../../core/services/service.service';
import { CommonModule } from '@angular/common';
import { RequestModalComponent } from '../request-modal/request-modal.component';
import { ServiceRequestService } from '../../../core/services/service-request.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ReviewSectionComponent } from '../../shared/review-section/review-section.component';
import { ReviewService } from '../../../core/services/review.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-service-details',
  templateUrl: './service-details.component.html',
  imports: [CommonModule, RequestModalComponent, DialogModule, ButtonModule, RouterLink, ToastModule, ReviewSectionComponent, FormsModule],
  providers: [MessageService]
})

export class ServiceDetailsComponent {
  service: Service | null = null;
  isModalOpen = false;
  hasPendingRequest = false;
  sellerIdFromQuery: string | null = null;
  isCheckingPendingRequest = true; // Add loading state for pending request check
  errorMessage: string | null = null;
  requestErrorMessage: string | null = null;
  deliveredRequestId: number | undefined = undefined;
  deliveredRequestLoading: boolean = false;
  eligibleDeliveredRequests: any[] = [];
  selectedDeliveredRequestId: number | undefined = undefined;

  constructor(
    private route: ActivatedRoute,
    private serviceService: ServiceService,
    private requestService: ServiceRequestService,
    private reviewService: ReviewService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.sellerIdFromQuery = this.route.snapshot.queryParamMap.get('seller');
    this.isCheckingPendingRequest = true; // Start loading state

    this.serviceService.getServiceById(id).subscribe({
      next: (service) => {
        this.service = service;
        this.errorMessage = null;
        // Check for pending request for this service
        this.checkPendingRequest(id);
        // Find delivered request for review
        this.findDeliveredRequestForReview();
      },
      error: (error) => {
        console.error('Error loading service:', error);
        this.errorMessage = error?.error || 'Service not found.';
        this.isCheckingPendingRequest = false;
      }
    });
  }

  findDeliveredRequestForReview() {
    if (!this.service) return;
    this.deliveredRequestLoading = true;
    this.requestService.getBuyerRequests(1, 100).subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.paginatedData) {
          const deliveredRequests = response.data.paginatedData.filter(
            (req: any) => req.serviceId === this.service!.id && req.serviceStatus === 'Delivered'
          );
          this.eligibleDeliveredRequests = [];
          if (deliveredRequests.length === 0) {
            this.deliveredRequestId = undefined;
            this.selectedDeliveredRequestId = undefined;
            this.deliveredRequestLoading = false;
            return;
          }
          const reviewChecks = deliveredRequests.map((req: any) =>
            this.reviewService.hasReviewedService(req.id).toPromise().then((res: any) => ({
              req,
              hasReviewed: res?.data === true
            }))
          );
          Promise.all(reviewChecks).then((results: any[]) => {
            this.eligibleDeliveredRequests = results.filter((r: any) => !r.hasReviewed).map((r: any) => r.req);
            this.selectedDeliveredRequestId = this.eligibleDeliveredRequests.length > 0 ? this.eligibleDeliveredRequests[0].id : undefined;
            this.deliveredRequestId = this.selectedDeliveredRequestId;
            this.deliveredRequestLoading = false;
          }).catch(() => {
            this.eligibleDeliveredRequests = [];
            this.selectedDeliveredRequestId = undefined;
            this.deliveredRequestId = undefined;
            this.deliveredRequestLoading = false;
          });
        } else {
          this.deliveredRequestId = undefined;
          this.selectedDeliveredRequestId = undefined;
          this.deliveredRequestLoading = false;
        }
      },
      error: () => {
        this.deliveredRequestId = undefined;
        this.selectedDeliveredRequestId = undefined;
        this.deliveredRequestLoading = false;
      }
    });
  }

  onDeliveredRequestChange(requestId: number | undefined) {
    this.selectedDeliveredRequestId = requestId;
    this.deliveredRequestId = requestId;
  }

    checkPendingRequest(serviceId: number) {
    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn('Pending request check timed out');
      this.isCheckingPendingRequest = false;
      this.hasPendingRequest = false;
    }, 10000); // 10 second timeout

    // Use the more reliable method - get all buyer requests and check for pending ones
    this.requestService.getBuyerRequests(1, 100).subscribe({
      next: (response: any) => {
        clearTimeout(timeout); // Clear timeout on success

        console.log('All buyer requests response:', response);

        if (response && response.data && response.data.paginatedData) {
          const requests = response.data.paginatedData;
          console.log('All buyer requests:', requests);

                              // Check if there's a pending request for this specific service
          // Exclude cancelled requests from being considered "pending"
          const pendingRequest = requests.find((req: any) => {
            console.log('Checking request:', req.serviceId, 'against service:', serviceId);
            console.log('Request status:', req.serviceStatus, 'Buyer approval:', req.buyerApprovalStatus);

            // Only consider it pending if:
            // 1. serviceStatus is 'Pending' (and not cancelled)
            // 2. OR buyerApprovalStatus is 'Pending' (and service is not cancelled)
            // 3. AND the request is not cancelled
            return req.serviceId === serviceId &&
                   req.serviceStatus !== 'Cancelled' &&
                   (req.serviceStatus === 'Pending' || req.buyerApprovalStatus === 'Pending');
          });

          console.log('Found pending request for this service:', pendingRequest);
          this.hasPendingRequest = !!pendingRequest;
        } else {
          // Fallback to the original method if the response structure is different
          this.fallbackPendingCheck(serviceId);
        }

        this.isCheckingPendingRequest = false;
      },
      error: (error) => {
        clearTimeout(timeout); // Clear timeout on error
        console.error('Error checking buyer requests:', error);
        // Fallback to original method
        this.fallbackPendingCheck(serviceId);
      }
    });
  }

  fallbackPendingCheck(serviceId: number) {
    console.log('Using fallback method for service ID:', serviceId);
    this.requestService.getServiceIdsWithPendingRequests().subscribe({
      next: (serviceIds: any) => {
        // Handle different possible response formats
        let pendingIds: number[] = [];
        if (Array.isArray(serviceIds)) {
          pendingIds = serviceIds;
        } else if (serviceIds && typeof serviceIds === 'object' && (serviceIds as any).data) {
          // If response is wrapped in a data object
          pendingIds = Array.isArray((serviceIds as any).data) ? (serviceIds as any).data : [];
        }

        console.log('Fallback - Pending service IDs:', pendingIds);
        // Check if current service ID is in the pending list
        this.hasPendingRequest = pendingIds.some(id => id == serviceId);
        this.isCheckingPendingRequest = false;
      },
      error: (error) => {
        console.error('Error in fallback check:', error);
        this.hasPendingRequest = false;
        this.isCheckingPendingRequest = false;
      }
    });
  }

  openRequestModal() {
    this.isModalOpen = true;
  }

  // Method to refresh pending request status (can be called when component becomes active)
  refreshPendingStatus() {
    if (this.service) {
      this.isCheckingPendingRequest = true;
      this.checkPendingRequest(this.service.id);
    }
  }



  onRequestSubmitted() {
    console.log('Request submitted - updating state');
    this.hasPendingRequest = true;
    this.isModalOpen = false;
    this.isCheckingPendingRequest = false; // Ensure loading state is off
    this.messageService.add({
      severity: 'success',
      summary: 'Request Submitted',
      detail: 'Your service request has been submitted successfully!'
    });
  }

  onReviewSubmitted() {
    // Optionally reload service details or reviews if needed
  }

  goBackToServices() {
    if (this.sellerIdFromQuery) {
      this.router.navigate(['/seller-profile', this.sellerIdFromQuery]);
    } else {
      this.router.navigate(['/services']);
    }
  }

  // Handler to show error from request modal and close modal
  handleRequestError(errorMsg: string) {
    this.isModalOpen = false;
    this.requestErrorMessage = null;
    this.messageService.add({
      severity: 'error',
      summary: 'Request Error',
      detail: errorMsg,
      life: 4000
    });
  }
}
