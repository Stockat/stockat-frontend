export interface AuctionCreateDto {
    name: string;
    description?: string;
    startingPrice: number;
    incrementUnit: number;
    quantity: number;
    startTime: string;     
    endTime: string;
    productId: number;
    sellerId: string;
    stockId: number;
  }
  