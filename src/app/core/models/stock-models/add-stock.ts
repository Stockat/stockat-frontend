export interface StockDetail {
  featureId: number;
  featureValueId: number;
}

export interface AddStock {
  productId: number;
  quantity: number;
  stockDetails: StockDetail[];
} 