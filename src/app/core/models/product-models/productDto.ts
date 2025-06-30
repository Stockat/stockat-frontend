export interface ProductDto {
  id: number;
  name: string;
  description: string;
  productStatus: ProductStatus;
  price: number;
  isDeleted: boolean;
  minQuantity: number;
  sellerId: string;
  images: string[];
}


export enum ProductStatus {
  Pending,
  Approved,
  Rejected,
  Activated,
  Deactivated
}