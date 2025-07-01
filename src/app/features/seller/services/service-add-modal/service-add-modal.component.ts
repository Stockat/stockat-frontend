import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-service-add-modal',
  templateUrl: './service-add-modal.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule, InputTextModule, ButtonModule]
})
export class ServiceAddModalComponent {
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  form: FormGroup;
  selectedFile: File | null = null;
  feedbackMessage: string = '';
  @Input() isAddingService = false;
  submitted = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      pricePerProduct: [0.01, [Validators.required, Validators.min(0.01)]],
      minQuantity: [1, [Validators.required, Validators.min(1)]],
      estimatedTime: ['', Validators.required],
    });
  }

  open() {
    this.visible = true;
    this.form.reset({ pricePerProduct: 0, minQuantity: 1 });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  submit() {
    this.submitted = true;
    if (this.form.valid && !this.isAddingService && this.selectedFile) {
      this.save.emit({ service: this.form.value, file: this.selectedFile });
    }
  }
}
