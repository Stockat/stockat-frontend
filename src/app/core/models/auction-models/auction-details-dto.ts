
export interface AuctionDetailsDto {
    id: number;
    name: string;
    description?: string;
    startingPrice: number;
    currentBid: number;
    incrementUnit: number;
    quantity: number;
  
    startTime: string; 
    endTime: string;     
    isClosed: boolean;
  
    buyerId?: string;
    sellerId: string;
    productId: number;
}
  