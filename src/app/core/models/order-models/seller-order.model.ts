export interface SellerOrder {
  id: number;
  quantity: number;
  price: number;
  orderType: string;
  status: string;
  craetedAt: string;
  paymentId: string;
  paymentStatus: string;
  productId: number;
  stockId: number;
  sellerId: string;
  sellerFirstName: string;
  sellerLastName: string;
  buyerId: string;
  buyerFirstName: string;
  buyerLastName: string;
} 