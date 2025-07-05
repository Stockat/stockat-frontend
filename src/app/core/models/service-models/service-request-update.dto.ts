export interface ServiceRequestUpdateDto {
  id: number;
  totalOldPrice: number;
  additionalPrice: number;
  additionalQuantity: number;
  additionalTime?: string;
  additionalNote?: string;
  status: string;
  createdAt?: Date;
}
