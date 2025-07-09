export interface ServiceEditRequestDto {
  id: number;
  serviceId: number;
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
}
