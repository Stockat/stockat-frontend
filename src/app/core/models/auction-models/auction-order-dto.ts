export interface AuctionOrderDto {
    id: number;
    orderDate: Date;
    status: OrderStatus;
    paymentTransactionId: string;
    paymentStatus: boolean;
    auctionId: number;
    winningBidId: number;
    amountPaid: number;
    sellerId?: string;
    sellerName?: string;
    auctionTitle?: string;
    buyerName?: string;
}


export enum OrderStatus {
    PendingSeller = 'PendingSeller',
    PendingBuyer = 'PendingBuyer',
    Processing = 'Processing',
    Ready = 'Ready',
    Pending = 'Pending',
    Shipped = 'Shipped',
    Completed = 'Completed',
    Cancelled = 'Cancelled',
    PaymentFailed = 'PaymentFailed',
    Delivered = 'Delivered',
    Payed = 'Payed'
  }

