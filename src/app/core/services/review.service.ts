import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenericRequestModel } from '../models/generic-request-Dto';
import { ReviewDto, CreateReviewDto, UpdateReviewDto, ProductReviewSummaryDto, ServiceReviewSummaryDto } from '../models/review-models/review.dto';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private apiUrl = 'http://localhost:5250/api/Review';

  constructor(private http: HttpClient) {}

  // Create Review
  createReview(createReviewDto: CreateReviewDto): Observable<GenericRequestModel<ReviewDto>> {
    return this.http.post<GenericRequestModel<ReviewDto>>(`${this.apiUrl}`, createReviewDto);
  }

  // Update Review
  updateReview(reviewId: number, updateReviewDto: UpdateReviewDto): Observable<GenericRequestModel<ReviewDto>> {
    return this.http.put<GenericRequestModel<ReviewDto>>(`${this.apiUrl}/${reviewId}`, updateReviewDto);
  }

  // Delete Review
  deleteReview(reviewId: number): Observable<GenericRequestModel<boolean>> {
    return this.http.delete<GenericRequestModel<boolean>>(`${this.apiUrl}/${reviewId}`);
  }

  // Get Review by ID
  getReviewById(reviewId: number): Observable<GenericRequestModel<ReviewDto>> {
    return this.http.get<GenericRequestModel<ReviewDto>>(`${this.apiUrl}/${reviewId}`);
  }

  // Get Product Reviews
  getProductReviews(productId: number, page: number = 1, size: number = 10): Observable<GenericRequestModel<ReviewDto[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<GenericRequestModel<ReviewDto[]>>(`${this.apiUrl}/product/${productId}`, { params });
  }

  // Get Service Reviews
  getServiceReviews(serviceId: number, page: number = 1, size: number = 10): Observable<GenericRequestModel<ReviewDto[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<GenericRequestModel<ReviewDto[]>>(`${this.apiUrl}/service/${serviceId}`, { params });
  }

  // Get User Reviews
  getUserReviews(page: number = 1, size: number = 10): Observable<GenericRequestModel<ReviewDto[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<GenericRequestModel<ReviewDto[]>>(`${this.apiUrl}/user`, { params });
  }

  // Get Product Review Summary
  getProductReviewSummary(productId: number): Observable<GenericRequestModel<ProductReviewSummaryDto>> {
    return this.http.get<GenericRequestModel<ProductReviewSummaryDto>>(`${this.apiUrl}/product/${productId}/summary`);
  }

  // Get Service Review Summary
  getServiceReviewSummary(serviceId: number): Observable<GenericRequestModel<ServiceReviewSummaryDto>> {
    return this.http.get<GenericRequestModel<ServiceReviewSummaryDto>>(`${this.apiUrl}/service/${serviceId}/summary`);
  }

  // Check if user can review product
  canReviewProduct(orderProductId: number): Observable<GenericRequestModel<boolean>> {
    return this.http.get<GenericRequestModel<boolean>>(`${this.apiUrl}/can-review-product/${orderProductId}`);
  }

  // Check if user can review service
  canReviewService(serviceRequestId: number): Observable<GenericRequestModel<boolean>> {
    return this.http.get<GenericRequestModel<boolean>>(`${this.apiUrl}/can-review-service/${serviceRequestId}`);
  }

  // Check if user has already reviewed product
  hasReviewedProduct(orderProductId: number): Observable<GenericRequestModel<boolean>> {
    return this.http.get<GenericRequestModel<boolean>>(`${this.apiUrl}/has-reviewed-product/${orderProductId}`);
  }

  // Check if user has already reviewed service
  hasReviewedService(serviceRequestId: number): Observable<GenericRequestModel<boolean>> {
    return this.http.get<GenericRequestModel<boolean>>(`${this.apiUrl}/has-reviewed-service/${serviceRequestId}`);
  }
} 