import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServiceService } from '../../../../core/services/service.service';
import { ServiceRequestService } from '../../../../core/services/service-request.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-seller-service-details-page',
  templateUrl: './seller-service-details-page.component.html',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, ReactiveFormsModule]
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

  constructor(
    private route: ActivatedRoute,
    private serviceService: ServiceService,
    private serviceRequestService: ServiceRequestService,
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
      this.serviceRequestService.getSellerRequestsByServiceId(+id).subscribe({
        next: (requests) => {
          this.requests = requests;
          this.loading = false;
        },
        error: () => {
          this.requests = [];
          this.loading = false;
        }
      });
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
    console.log('Submitting offer:', offer);
    this.serviceRequestService.setSellerOffer(this.selectedRequest.id, offer).subscribe({
      next: () => {
        this.offerSuccess = 'Offer sent successfully!';
        this.offerLoading = false;
        setTimeout(() => {
          this.closeOfferModal();
        }, 1000);
      },
      error: (err) => {
        this.offerError = 'Failed to send offer.';
        this.offerLoading = false;
      }
    });
  }
}
