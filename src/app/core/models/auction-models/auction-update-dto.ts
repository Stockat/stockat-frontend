export interface AuctionUpdateDto {
    name?: string;
    description?: string;
    quantity?: number;
    startingPrice?: number;
    startTime?: string;  // or string if your API expects ISO
    endTime?: string;
    isClosed?: boolean;
    productId?: number;
    stockId?: number;
}
  