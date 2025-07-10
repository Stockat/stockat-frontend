import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceRequestService } from '../../../core/services/service-request.service';
import { ServiceService } from '../../../core/services/service.service';
import { Service } from '../../../core/models/service-models/service.dto';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-request-modal',
  templateUrl: './request-modal.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, InputTextModule, InputTextarea, ButtonModule, ToastModule],
  providers: [MessageService]
})
export class RequestModalComponent {
  @Input() serviceId!: number;
  @Input() minQuantity!: number;
  @Input() service!: Service; // Pass the service from parent instead of fetching it
  @Output() close = new EventEmitter<void>();
  @Output() requestSubmitted = new EventEmitter<void>();
  @Output() error = new EventEmitter<string>();
  requestForm!: FormGroup;
  isSubmitting = false; // Add loading state for submission

  constructor(
    private fb: FormBuilder,
    private requestService: ServiceRequestService,
    private messageService: MessageService
  ) {}

   ngOnInit(): void {
    // Initialize form with the service data passed from parent
    this.requestForm = this.fb.group({
      requestedQuantity: [
        null,
        [
          Validators.required,
          Validators.min(this.minQuantity),
          Validators.pattern('^[0-9]+$'),
        ],
      ],
      requestDescription: ['', Validators.required],
    });
  }


  submitRequest() {
    if (this.requestForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const payload = {
      serviceId: this.serviceId,
      ...this.requestForm.value,
    };

    this.requestService.createRequest(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        console.log('Request created successfully - emitting requestSubmitted event');
        this.requestSubmitted.emit();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Request sent successfully'
        });
        this.close.emit();
      },
      error: (err: any) => {
        this.isSubmitting = false;
        let errorMsg = 'An error occurred. Please try again.';
        if (err?.error) {
          if (typeof err.error === 'string') {
            errorMsg = err.error;
          } else if (err.error.message) {
            errorMsg = err.error.message;
          }
        } else if (err?.message) {
          errorMsg = err.message;
        }
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMsg
        });
        this.error.emit(errorMsg);
        // Do not close the modal here; parent will handle it
      }
    });
  }



  handleClose() {
    this.close.emit();
  }
}
