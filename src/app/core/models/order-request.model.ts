export interface OrderRequest {
  quantity: number;
  price: number;
  orderType: 'Request' | string;
  status: 'PendingSeller' | string;
  productId: number;
  stockId: number;
  sellerId: string;
  buyerId: string;
  paymentId: string;
  paymentStatus: string;
} 