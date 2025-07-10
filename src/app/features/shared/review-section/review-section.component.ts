import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextarea } from 'primeng/inputtextarea';
import { RatingModule } from 'primeng/rating';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';

import { ReviewService } from '../../../core/services/review.service';
import { ReviewDto, CreateReviewDto, UpdateReviewDto, ProductReviewSummaryDto, ServiceReviewSummaryDto } from '../../../core/models/review-models/review.dto';

@Component({
  selector: 'app-review-section',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextarea,
    RatingModule,
    ToastModule,
    DialogModule,
    ConfirmDialogModule,
    AvatarModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './review-section.component.html',
  styleUrls: ['./review-section.component.css']
})
export class ReviewSectionComponent implements OnInit {
  @Input() itemId!: number;
  @Input() itemType: 'product' | 'service' = 'product';
  @Input() orderProductId?: number;
  @Input() serviceRequestId?: number;
  @Output() reviewSubmitted = new EventEmitter<void>();

  reviews: ReviewDto[] = [];
  reviewSummary?: ProductReviewSummaryDto | ServiceReviewSummaryDto;
  currentPage = 1;
  pageSize = 10;
  totalReviews = 0;
  isLoading = false;
  isLoadingSummary = false;

  // Review form
  reviewForm: FormGroup;
  isReviewModalVisible = false;
  isEditMode = false;
  editingReviewId?: number;

  // User review status
  canReview = false;
  hasReviewed = false;
  userReview?: ReviewDto;

  constructor(
    private reviewService: ReviewService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
    });
  }

  ngOnInit(): void {
    this.loadReviewSummary();
    this.loadReviews();
    this.checkUserReviewStatus();
  }

  loadReviewSummary(): void {
    this.isLoadingSummary = true;
    
    if (this.itemType === 'product') {
      this.reviewService.getProductReviewSummary(this.itemId).subscribe({
        next: (response: any) => {
          if (response.status === 200) {
            this.reviewSummary = response.data;
          }
        },
        error: (error: any) => {
          console.error('Error loading review summary:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load review summary'
          });
        },
        complete: () => {
          this.isLoadingSummary = false;
        }
      });
    } else {
      this.reviewService.getServiceReviewSummary(this.itemId).subscribe({
        next: (response: any) => {
          if (response.status === 200) {
            this.reviewSummary = response.data;
          }
        },
        error: (error: any) => {
          console.error('Error loading review summary:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load review summary'
          });
        },
        complete: () => {
          this.isLoadingSummary = false;
        }
      });
    }
  }

  loadReviews(): void {
    this.isLoading = true;
    
    if (this.itemType === 'product') {
      this.reviewService.getProductReviews(this.itemId, this.currentPage, this.pageSize).subscribe({
        next: (response: any) => {
          if (response.status === 200) {
            this.reviews = response.data;
          }
        },
        error: (error: any) => {
          console.error('Error loading reviews:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load reviews'
          });
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.reviewService.getServiceReviews(this.itemId, this.currentPage, this.pageSize).subscribe({
        next: (response: any) => {
          if (response.status === 200) {
            this.reviews = response.data;
          }
        },
        error: (error: any) => {
          console.error('Error loading reviews:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load reviews'
          });
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  checkUserReviewStatus(): void {
    if (this.itemType === 'product' && this.orderProductId) {
      this.checkProductReviewStatus();
    } else if (this.itemType === 'service' && this.serviceRequestId) {
      this.checkServiceReviewStatus();
    }
  }

  private checkProductReviewStatus(): void {
    if (!this.orderProductId) return;

    // Check if user can review
    this.reviewService.canReviewProduct(this.orderProductId).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.canReview = response.data;
        }
      }
    });

    // Check if user has already reviewed
    this.reviewService.hasReviewedProduct(this.orderProductId).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.hasReviewed = response.data;
        }
      }
    });
  }

  private checkServiceReviewStatus(): void {
    if (!this.serviceRequestId) return;

    // Check if user can review
    this.reviewService.canReviewService(this.serviceRequestId).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.canReview = response.data;
        }
      }
    });

    // Check if user has already reviewed
    this.reviewService.hasReviewedService(this.serviceRequestId).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.hasReviewed = response.data;
        }
      }
    });
  }

  openReviewModal(): void {
    this.isEditMode = false;
    this.editingReviewId = undefined;
    this.reviewForm.reset();
    this.isReviewModalVisible = true;
  }

  openEditModal(review: ReviewDto): void {
    this.isEditMode = true;
    this.editingReviewId = review.id;
    this.reviewForm.patchValue({
      rating: review.rating,
      comment: review.comment
    });
    this.isReviewModalVisible = true;
  }

  submitReview(): void {
    if (this.reviewForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields correctly'
      });
      return;
    }

    const formValue = this.reviewForm.value;
    
    if (this.isEditMode && this.editingReviewId) {
      this.updateReview(formValue);
    } else {
      this.createReview(formValue);
    }
  }

  private createReview(formValue: any): void {
    const createReviewDto: CreateReviewDto = {
      rating: formValue.rating,
      comment: formValue.comment,
      ...(this.itemType === 'product' 
        ? { productId: this.itemId, orderProductId: this.orderProductId }
        : { serviceId: this.itemId, serviceRequestId: this.serviceRequestId }
      )
    };

    this.reviewService.createReview(createReviewDto).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Review submitted successfully'
          });
          this.isReviewModalVisible = false;
          this.loadReviews();
          this.loadReviewSummary();
          this.checkUserReviewStatus();
          this.reviewSubmitted.emit();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to submit review'
          });
        }
      },
      error: (error) => {
        console.error('Error creating review:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to submit review'
        });
      }
    });
  }

  private updateReview(formValue: any): void {
    if (!this.editingReviewId) return;

    const updateReviewDto: UpdateReviewDto = {
      rating: formValue.rating,
      comment: formValue.comment
    };

    this.reviewService.updateReview(this.editingReviewId, updateReviewDto).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Review updated successfully'
          });
          this.isReviewModalVisible = false;
          this.loadReviews();
          this.loadReviewSummary();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to update review'
          });
        }
      },
      error: (error) => {
        console.error('Error updating review:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update review'
        });
      }
    });
  }

  deleteReview(review: ReviewDto): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this review?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.reviewService.deleteReview(review.id).subscribe({
          next: (response) => {
            if (response.status === 200) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Review deleted successfully'
              });
              this.loadReviews();
              this.loadReviewSummary();
              this.checkUserReviewStatus();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.message || 'Failed to delete review'
              });
            }
          },
          error: (error) => {
            console.error('Error deleting review:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete review'
            });
          }
        });
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadReviews();
  }

  getRatingDistribution(rating: number): number {
    if (!this.reviewSummary) return 0;
    
    const total = this.reviewSummary.totalReviews;
    if (total === 0) return 0;

    const count = this.getRatingCount(rating);
    return (count / total) * 100;
  }

  getRatingCount(rating: number): number {
    if (!this.reviewSummary) return 0;
    
    switch (rating) {
      case 5: return this.reviewSummary.fiveStarCount;
      case 4: return this.reviewSummary.fourStarCount;
      case 3: return this.reviewSummary.threeStarCount;
      case 2: return this.reviewSummary.twoStarCount;
      case 1: return this.reviewSummary.oneStarCount;
      default: return 0;
    }
  }

  getStarColor(rating: number, currentRating: number): string {
    return rating <= currentRating ? 'text-yellow-400' : 'text-gray-300';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
} 