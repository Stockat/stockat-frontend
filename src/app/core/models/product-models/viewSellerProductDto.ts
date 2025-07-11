import { ProductStatus } from './productDto';

export interface viewSellerProductDto {
  id: number;
  name: string;
  productStatus: ProductStatus;
  price: number;
  sellerId: string;
  image: string[]; // List of image URLs
  canBeRequested: boolean; // List of image URLs
  rejectionReason?: string;
}
