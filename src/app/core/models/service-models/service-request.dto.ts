export interface ServiceRequestDto {
  serviceId: number;
  requestedQuantity: number;
  requestDescription: string;
  pricePerProduct?: number;
  estimatedTime?: string;
  totalPrice?: number;
  sellerApprovalStatus?: string;
  buyerApprovalStatus?: string;
  serviceStatus?: string;
  paymentStatus?: string;
}
