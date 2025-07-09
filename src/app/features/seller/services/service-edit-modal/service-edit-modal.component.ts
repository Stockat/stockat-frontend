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
      // Parse estimatedTime (e.g., '2 days')
      let estimatedTimeValue = 1;
      let estimatedTimeUnit = 'day(s)';
      if (this.service.estimatedTime) {
        const match = this.service.estimatedTime.match(/^(\d+)\s*(day\(s\)|week\(s\)|month\(s\))$/);
        if (match) {
          estimatedTimeValue = +match[1];
          estimatedTimeUnit = match[2];
        } else {
          // fallback: try to split by space
          const parts = this.service.estimatedTime.split(' ');
          if (parts.length === 2) {
            estimatedTimeValue = +parts[0];
            estimatedTimeUnit = parts[1];
          }
        }
      }
      this.form = this.fb.group({
        name: [this.service.name, Validators.required],
        description: [this.service.description, Validators.required],
        pricePerProduct: [this.service.pricePerProduct, [Validators.required, Validators.min(0.01)]],
        minQuantity: [this.service.minQuantity, [Validators.required, Validators.min(1)]],
        estimatedTimeValue: [estimatedTimeValue, [Validators.required, Validators.min(1)]],
        estimatedTimeUnit: [estimatedTimeUnit, Validators.required],
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
      const { estimatedTimeValue, estimatedTimeUnit, ...rest } = this.form.value;
      const estimatedTime = `${estimatedTimeValue} ${estimatedTimeUnit}`;
      this.save.emit({ ...this.service, ...rest, estimatedTime, file: this.selectedFile });
    }
  }
}
