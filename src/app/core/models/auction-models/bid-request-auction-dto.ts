export interface AuctionBidRequestCreateDto {
    auctionId: number;
    bidderId: string;
    bidAmount: number;
}