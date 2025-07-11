export interface ReviewDto {
  id: number;
  rating: number;
  comment: string;
  reviewerId: string;
  reviewerName: string;
  reviewerEmail: string;
  reviewerImageUrl?: string;
  
  // For Product Reviews
  productId?: number;
  productName?: string;
  orderProductId?: number;
  
  // For Service Reviews
  serviceId?: number;
  serviceName?: string;
  serviceRequestId?: number;
  
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReviewDto {
  rating: number;
  comment: string;
  
  // For Product Reviews
  productId?: number;
  orderProductId?: number;
  
  // For Service Reviews
  serviceId?: number;
  serviceRequestId?: number;
}

export interface UpdateReviewDto {
  rating: number;
  comment: string;
}

export interface ProductReviewSummaryDto {
  productId: number;
  productName: string;
  averageRating: number;
  totalReviews: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
}

export interface ServiceReviewSummaryDto {
  serviceId: number;
  serviceName: string;
  averageRating: number;
  totalReviews: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
} 