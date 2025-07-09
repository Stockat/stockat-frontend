import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-service-edit-modal',
  templateUrl: './service-edit-modal.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule, InputTextModule, ButtonModule]
})
export class ServiceEditModalComponent {
  @Input() visible = false;
  @Input() service: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  form!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnChanges() {
    if (this.service) {
      this.form = this.fb.group({
        name: [this.service.name, Validators.required],
        description: [this.service.description, Validators.required],
        pricePerProduct: [this.service.pricePerProduct, [Validators.required, Validators.min(0.01)]],
        minQuantity: [this.service.minQuantity, [Validators.required, Validators.min(1)]],
        estimatedTime: [this.service.estimatedTime, Validators.required],
      });
      this.imagePreview = this.service.imageUrl || null;
      this.selectedFile = null;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  submit() {
    if (this.form.valid) {
      this.save.emit({ ...this.service, ...this.form.value, file: this.selectedFile });
    }
  }
}
