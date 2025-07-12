export interface AuctionBidRequestDto {
    id: number;
    auctionId: number;
    bidderId: string;
    bidAmount: number;
    auctionOrderId?: number;

    //only for view 
    bidderName?: string;
    iswinner?: boolean;
    auction?: {
        startTime: string;
        endTime: string;
        id?: number;
        name?: string;
        currentBid?: number;
        buyerId?: string;
    };
}
  