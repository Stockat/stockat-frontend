export interface AuctionOrderDto {
    id: number;
    orderDate: Date;
    status: OrderStatus;
    paymentTransactionId: string;
    //paymentStatus: boolean;
    auctionId: number;
    winningBidId: number;
    amountPaid: number;
    sellerId?: string;
    sellerName?: string;
    auctionTitle?: string;
    buyerName?: string;
    buyerId?: string;
    // New fields for shipping/order info
    shippingAddress?: string;
    recipientName?: string;
    phoneNumber?: string;
    notes?: string;

    //
    paymentStatus: PaymentStatus;
    stripeSessionId?: string;
    stripePaymentIntentId?: string;

    // Enhanced fields from backend to avoid excessive API calls
    auctionDescription?: string;
    winningBidAmount?: number;
}

export enum PaymentStatus {
    Pending = 0,
    Paid = 1,
    Failed = 2,
    Refunded = 3
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

