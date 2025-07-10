export interface ServiceEditRequestDto {
  id: number;
  serviceId: number;

  // Current service values
  currentName: string;
  currentDescription: string;
  currentMinQuantity: number;
  currentPricePerProduct: number;
  currentEstimatedTime: string;
  currentImageUrl: string;

  // New values
  editedName: string;
  editedDescription: string;
  editedMinQuantity: number;
  editedPricePerProduct: number;
  editedEstimatedTime: string;
  editedImageId: string;
  editedImageUrl: string;

  approvalStatus: string;
  createdAt: string;
  reviewedAt?: string;
  adminNote?: string;
  isReactivationRequest: boolean;
}
