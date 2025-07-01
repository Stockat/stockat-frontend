import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceRequestService } from '../../../core/services/service-request.service';
import { ServiceService } from '../../../core/services/service.service';
import { Service } from '../../../core/models/service-models/service.dto';
import Swal from 'sweetalert2';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-request-modal',
  templateUrl: './request-modal.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, InputTextModule, InputTextarea, ButtonModule]
})
export class RequestModalComponent {
  @Input() serviceId!: number;
  @Input() minQuantity!: number;
  @Output() close = new EventEmitter<void>();
  @Output() requestSubmitted = new EventEmitter<void>();
  service!:Service;
  requestForm!: FormGroup;

  constructor(private fb: FormBuilder, private requestService: ServiceRequestService, private serviceService: ServiceService) {}

   ngOnInit(): void {
    this.serviceService.getServiceById(this.serviceId).subscribe({
      next: (data) => {
        this.service = data;

        this.requestForm = this.fb.group({
          requestedQuantity: [
            null,
            [
              Validators.required,
              Validators.min(this.service.minQuantity),
              Validators.pattern('^[0-9]+$'),
            ],
          ],
          requestDescription: ['', Validators.required],
        });
      },
      error: (error) => {
        console.error('Error fetching service:', error);
      },
    });
  }


  submitRequest() {
    if (this.requestForm.invalid) return;

    const payload = {
      serviceId: this.serviceId,
      ...this.requestForm.value,
    };

    this.requestService.createRequest(payload).subscribe({
      next: () => {
        this.requestSubmitted.emit();
        Swal.fire({
          icon: 'success',
          title: 'Request sent successfully',
          showConfirmButton: false,
          timer: 1500
        });
        this.close.emit();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Request failed',
          text: err?.error|| 'An error occurred. Please try again.',
        });
        this.close.emit(); // Close modal after error
      }
    });
  }



  handleClose() {
    this.close.emit();
  }
}
