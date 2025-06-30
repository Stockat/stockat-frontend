export interface PaginationDto<T> {
  page: number;
  size: number;
  count: number;
  paginatedData: [T];
}
