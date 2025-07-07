export interface FeatureValue {
  id: number;
  value: string;
}

export interface Feature {
  id: number;
  name: string;
  values: FeatureValue[];
}

export interface ProductWithFeatures {
  id: number;
  name: string;
  description: string;
  price: number;
  sellerId: string;
  sellerName: string;
  images: string[];
  features: Feature[];
  minQuantity: number;
} 