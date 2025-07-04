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

@Component({
  selector: 'app-service-request-details',
  standalone: true,
  templateUrl: './service-request-details.component.html',
  imports:[CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, RouterModule]
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

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private requestService: ServiceRequestService,
    private requestUpdateService: ServiceRequestUpdateService,
    private fb: FormBuilder
  ) {
    this.updateForm = this.fb.group({
      additionalPrice: [null],
      additionalQuantity: [null],
      additionalTime: [''],
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
      this.requestUpdateService.getUpdatesByRequestId(+id).subscribe({
        next: (data: any) => {
          this.updates = data;
          this.hasPendingUpdate = Array.isArray(data) && data.some((u: any) => u.status === 'Pending');
        },
        error: () => {
          this.updates = [];
          this.hasPendingUpdate = false;
        }
      });
    }
  }

  canUpdate() {
    const { additionalPrice, additionalQuantity, additionalTime } = this.updateForm.value;
    return additionalPrice || additionalQuantity || additionalTime;
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
    const payload = {
      additionalPrice: this.updateForm.value.additionalPrice,
      additionalQuantity: this.updateForm.value.additionalQuantity,
      additionalTime: this.updateForm.value.additionalTime,
      additionalNote: this.updateForm.value.additionalNote
    };
    this.requestUpdateService.createUpdate(this.request.id, payload).subscribe({
      next: () => {
        this.updateSuccess = 'Update request sent!';
        this.updateLoading = false;
        this.ngOnInit();
        this.closeUpdateModal();
      },
      error: () => {
        this.updateError = 'Failed to send update.';
        this.updateLoading = false;
      }
    });
  }

  cancelRequest() {
  this.updateLoading = true;
  this.updateError = '';
  this.updateSuccess = '';
  this.requestService.cancelRequest(this.request.id).subscribe({
    next: () => {
      this.updateSuccess = 'Request cancelled successfully.';
      this.request.serviceStatus = 'Cancelled'; // or update as per your backend response
      this.updateLoading = false;
    },
    error: (err) => {
      this.updateError = 'Failed to cancel request.';
      this.updateLoading = false;
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
    this.requestUpdateService.getUpdatesByRequestId(this.request.id).subscribe({
      next: (data: any) => {
        this.updates = data;
        this.hasPendingUpdate = Array.isArray(data) && data.some((u: any) => u.status === 'Pending');
      },
      error: () => {
        this.updates = [];
        this.hasPendingUpdate = false;
      }
    });
  }

  goBack() {
    this.back.emit();
  }

  isNegotiationClosed(): boolean {
    return this.request && typeof this.request.sellerOfferAttempts === 'number' && this.request.sellerOfferAttempts >= 3 && this.request.buyerApprovalStatus === 'Rejected';
  }
}
