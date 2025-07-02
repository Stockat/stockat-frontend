export interface AddProductDto {
  name: string;
  description: string;
  price: number;
  minQuantity: number;
  categoryId: number;
  sellerId: string;
  location: string;
  features: AddFeatureDto[];
  productTags: AddTagDto[];
  images?: File[];
}
export interface AddFeatureValuesDto {
  name: string;
}

export interface AddFeatureDto {
  name: string;
  featureValues: AddFeatureValuesDto[];
}



export interface AddTagDto {
  tagId: number;
}
