export interface GenericRequestModel<T> {
  message: string;
  status: number;
  redirectUrl: string | null;
  data: T;
}
