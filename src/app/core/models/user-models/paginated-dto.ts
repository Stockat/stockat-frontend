export interface PaginatedDto<T> {
  page: number;
  size: number;
  count: number;
  paginatedData: T;
} 