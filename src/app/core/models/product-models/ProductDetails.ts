import { ProductStatus } from './productDto';

export interface ProductDetailsDto {
  id: number;
  name: string;
  description: string;
  productStatus: ProductStatus;
  price: number;
  sellerId: string;
  sellerName: string;
  minQuantity: number;
  imagesArr: string[];
}