export interface UpdateProductDto {
  id: number;
  name: string;
  description: string;
  price: number;
  minQuantity: number;
  categoryId: number;
  sellerId: string;
  location: string;
  features: updateFeatureDto[];
  productTags: updateTagDto[];
  images?: updateImageDto[];
}
export interface updateFeatureValuesDto {
  id: number;
  name: string;
}

export interface updateFeatureDto {
  id: number;
  name: string;
  featureValues: updateFeatureValuesDto[];
}

export interface updateTagDto {
  tagId: number;
  tagName: string;
}

export interface updateImageDto {
  id: number;
  imageUrl: string;
  fileId: string|null;
}
