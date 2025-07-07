export interface ProductFilters {
  location:string;
  category: string;
  tags: string[];
  minQuantity: number;
  minPrice: number;
  page: number;
  size: number;
  sortBy: string|null; // Optional, for sorting by a specific field
  filterDirection?: 'asc' | 'desc'; // Optional, for sorting
  productStatus?: string; // Optional, for filtering by product status
  isDeleted?: boolean; // Optional, for filtering by deletion status
}
