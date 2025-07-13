export interface AuditDto {
  id: number;
  orderProductId: number;
  userId: string;
  changedAt: string;
  oldRecordJson: string;
  newRecordJson: string;
}

export interface AuditRecord {
  Id: number;
  Quantity: number;
  Price: number;
  OrderType: number;
  Status: number;
  CraetedAt: string;
  EstimatedDeliveryTime: string | null;
  SessionId: string | null;
  PaymentId: string;
  PaymentStatus: number;
  PaymentDate: string | null;
  ProductId: number;
  StockId: number;
  SellerId: string;
  BuyerId: string;
  Product: any | null;
  Stock: any | null;
  Seller: any | null;
  Buyer: any | null;
  Description: string;
}
