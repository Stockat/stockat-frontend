export interface PagedResponse<T> {
    data: T[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  }
  