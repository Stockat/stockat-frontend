import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServiceRequestService } from '../../core/services/service-request.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ServiceRequestUpdateService } from '../../core/services/service-request-update.service';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { PaginatorState } from 'primeng/paginator';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-service-request-details',
  standalone: true,
  templateUrl: './service-request-details.component.html',
  imports:[CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, RouterModule, PaginatorModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService]
})
export class ServiceRequestDetailsComponent implements OnInit {
  @Input() requestId!: number;
  @Output() back = new EventEmitter<void>();

  request: any = null;
  loading = true;
  updateForm: FormGroup;
  updateLoading = false;
  updateError = '';
  updateSuccess = '';
  updateModalVisible = false;
  updates: any[] = [];
  hasPendingUpdate = false;

  // Pagination properties
  totalUpdates: number = 0;
  updatesPage: number = 0;
  updatesSize: number = 5;
  updatesLoading = false;

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private requestService: ServiceRequestService,
    private requestUpdateService: ServiceRequestUpdateService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService
  ) {
    this.updateForm = this.fb.group({
      additionalPrice: [null],
      additionalQuantity: [null],
      additionalTimeValue: [1],
      additionalTimeUnit: ['day(s)'],
      additionalNote: ['']
    });
  }

  ngOnInit() {
    const id = this.requestId;
    if (id) {
      this.requestService.getRequestById(+id).subscribe({
        next: (data) => {
          this.request = data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
      this.fetchUpdates();
    }
  }

    fetchUpdates() {
    if (!this.requestId) return;

    this.updatesLoading = true;
    // Convert 0-based page to 1-based for API
    const apiPage = this.updatesPage + 1;
    console.log('Fetching updates for request:', this.requestId, 'Page:', apiPage, 'Size:', this.updatesSize);

    this.requestUpdateService.getUpdatesByRequestId(this.requestId, apiPage, this.updatesSize).subscribe({
      next: (response: any) => {
        console.log('Updates API response:', response);

        if (response && response.data) {
          this.updates = response.data.paginatedData || response.data;
          this.totalUpdates = response.data.count || this.updates.length;
          // Convert 1-based page back to 0-based for PrimeNG
          this.updatesPage = (response.data.page || 1) - 1;
          this.updatesSize = response.data.size || 5;
        } else {
          // Handle case where response is direct array
          this.updates = Array.isArray(response) ? response : [];
          this.totalUpdates = this.updates.length;
        }

        console.log('Processed updates:', this.updates);
        console.log('Total updates:', this.totalUpdates);
        console.log('Current page:', this.updatesPage);
        console.log('Page size:', this.updatesSize);

        this.hasPendingUpdate = this.updates.some((u: any) => u.status === 'Pending');
        this.updatesLoading = false;
      },
      error: (error) => {
        console.error('Error fetching updates:', error);
        this.updates = [];
        this.hasPendingUpdate = false;
        this.updatesLoading = false;
      }
    });
  }

  canUpdate() {
    const { additionalPrice, additionalQuantity, additionalTimeValue } = this.updateForm.value;
    return additionalPrice || additionalQuantity || additionalTimeValue;
  }

  openUpdateModal() {
    this.updateError = '';
    this.updateSuccess = '';
    this.updateForm.reset();
    this.updateModalVisible = true;
  }

  closeUpdateModal() {
    this.updateModalVisible = false;
  }

  submitUpdate() {
    if (!this.canUpdate()) {
      this.updateError = 'Please provide at least one field to update.';
      return;
    }
    this.updateLoading = true;
    this.updateError = '';
    this.updateSuccess = '';
    const { additionalTimeValue, additionalTimeUnit, ...rest } = this.updateForm.value;
    const additionalTime = additionalTimeValue ? `${additionalTimeValue} ${additionalTimeUnit}` : '';
    const payload = {
      ...rest,
      additionalTime
    };
    this.requestUpdateService.createUpdate(this.request.id, payload).subscribe({
      next: () => {
        this.updateSuccess = 'Update request sent!';
        this.updateLoading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Update Sent',
          detail: 'Your update request has been sent to the seller successfully!'
        });
        this.ngOnInit();
        this.closeUpdateModal();
      },
      error: (err: any) => {
        this.updateError = 'Failed to send update.';
        this.updateLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error || 'Failed to send update request. Please try again.'
        });
      }
    });
  }

  cancelRequest() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to cancel this request? This action cannot be undone.',
      header: 'Cancel Request',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Cancel',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.updateLoading = true;
        this.updateError = '';
        this.updateSuccess = '';
        this.requestService.cancelRequest(this.request.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Request Cancelled',
              detail: 'Your request has been cancelled successfully.'
            });
            this.request.serviceStatus = 'Cancelled';
            this.updateLoading = false;
          },
          error: (err: any) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err?.error || 'Failed to cancel request. Please try again.'
            });
            this.updateLoading = false;
          }
        });
      }
    });
  }

acceptSellerOffer(request: any) {
    this.requestService.updateBuyerStatus(request.id, 'Approved').subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Offer Accepted', detail: 'You have accepted the seller offer.' });
        this.refreshRequest();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to accept offer.' });
      }
    });
  }

  rejectSellerOffer(request: any) {
    if (confirm('Are you sure you want to reject this offer?')) {
      this.requestService.updateBuyerStatus(request.id, 'Rejected').subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Offer Rejected', detail: 'You have rejected the seller offer.' });
          this.refreshRequest();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to reject offer.' });
        }
      });
    }
  }

  refreshRequest() {
    if (!this.request?.id) return;
    this.loading = true;
    this.requestService.getRequestById(this.request.id).subscribe({
      next: (data) => {
        this.request = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
    this.fetchUpdates();
  }

  onUpdatesPageChange(event: PaginatorState) {
    this.updatesPage = event.page ?? 0;
    this.updatesSize = event.rows ?? 5;
    this.fetchUpdates();
  }

  goBack() {
    this.back.emit();
  }

  isNegotiationClosed(): boolean {
    return this.request && typeof this.request.sellerOfferAttempts === 'number' && this.request.sellerOfferAttempts >= 3 && this.request.buyerApprovalStatus === 'Rejected';
  }
}
