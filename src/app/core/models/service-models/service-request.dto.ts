export interface ServiceRequestDto {
  serviceId: number;
  serviceTitle: string;
  requestedQuantity: number;
  requestDescription: string;
  pricePerProduct?: number;
  estimatedTime?: string;
  totalPrice?: number;
  sellerApprovalStatus?: string;
  buyerApprovalStatus?: string;
  serviceStatus?: string;
  paymentStatus?: string;
  sellerId?: string;
  sellerName?: string;
  imageUrl?: string;
  sellerOfferAttempts:number;
  createdAt: Date;

  // SNAPSHOT FIELDS
  serviceNameSnapshot: string;
  serviceDescriptionSnapshot?: string;
  serviceMinQuantitySnapshot: number;
  servicePricePerProductSnapshot: number;
  serviceEstimatedTimeSnapshot?: string;
  serviceImageUrlSnapshot?: string;
}
