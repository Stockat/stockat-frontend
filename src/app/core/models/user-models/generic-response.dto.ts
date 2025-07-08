export interface GenericResponseDto<T> {
  message: string;
  status: number;
  data: T;
  redirectUrl?: string;
} 