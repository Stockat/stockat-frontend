export enum ApprovalStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Cancelled = 'Cancelled'
}

export interface Service {
  id: number;
  name: string;
  description: string;
  minQuantity: number;
  pricePerProduct: number;
  estimatedTime: string;
  imageUrl: string;
  imageId: string;
  sellerId: string;
  sellerName: string;
  isApproved?: ApprovalStatus;
  isDeleted: boolean;
  createdAt: Date;
  // Seller status information
  sellerIsDeleted?: boolean;
  sellerIsBlocked?: boolean;
  sellerIsApproved?: boolean;
}
