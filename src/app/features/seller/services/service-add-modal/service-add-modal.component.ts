import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-service-add-modal',
  templateUrl: './service-add-modal.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule, InputTextModule, ButtonModule, ProgressSpinnerModule]
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
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      pricePerProduct: [0.01, [Validators.required, Validators.min(0.01)]],
      minQuantity: [1, [Validators.required, Validators.min(1)]],
      estimatedTimeValue: [1, [Validators.required, Validators.min(1)]],
      estimatedTimeUnit: ['day(s)', Validators.required],
    });
  }

  open() {
    this.visible = true;
    this.form.reset({ pricePerProduct: 0, minQuantity: 1 });
  }

    onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file
      if (this.isValidImageFile(file)) {
        this.selectedFile = file;
        this.feedbackMessage = '';
      } else {
        this.selectedFile = null;
        this.clearFileInput();
      }
    } else {
      this.selectedFile = null;
    }
  }

    // Method to validate image file extension and size
  private isValidImageFile(file: File): boolean {
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
    const fileName = file.name.toLowerCase();
    const maxSizeInMB = 10;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    // Check file extension
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

    // Check file size
    const hasValidSize = file.size <= maxSizeInBytes;

    if (!hasValidExtension) {
      this.feedbackMessage = 'Please select a valid image file (PNG, JPG, JPEG, GIF)';
      return false;
    }

    if (!hasValidSize) {
      this.feedbackMessage = `File size must be less than ${maxSizeInMB}MB`;
      return false;
    }

    return true;
  }

  submit() {
    this.submitted = true;
    if (this.form.valid && !this.isAddingService && this.selectedFile) {
      const { estimatedTimeValue, estimatedTimeUnit, ...rest } = this.form.value;
      const estimatedTime = `${estimatedTimeValue} ${estimatedTimeUnit}`;
      this.save.emit({ service: { ...rest, estimatedTime }, file: this.selectedFile });
    }
  }

  onClose() {
    this.resetForm();
    this.close.emit();
  }

  resetForm() {
    this.form.reset({
      pricePerProduct: 0.01,
      minQuantity: 1,
      estimatedTimeValue: 1,
      estimatedTimeUnit: 'day(s)'
    });
    this.selectedFile = null;
    this.submitted = false;
    this.feedbackMessage = '';

    // Safely clear the file input
    this.clearFileInput();
  }

  // Method to trigger file input click
  triggerFileInput() {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }

  // Method to clear file input
  clearFileInput() {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // Method to remove selected file
  removeSelectedFile() {
    this.selectedFile = null;
    this.clearFileInput();
  }

  // Getter for description character count
  get descriptionCharCount(): number {
    return this.form.get('description')?.value?.length || 0;
  }

  // Getter for description max length
  get descriptionMaxLength(): number {
    return 1000;
  }
}
