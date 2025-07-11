export interface AnalysisDto {
  Request: number;
  Order: number;
}
export interface BarChartAnalysisDto {
  labels: string[];
  values: number[];
}

export interface BarChartAnalysisFilterationDto {
  type: OrderType;
  status: OrderStatus;
  metricType: ReportMetricType;
  time: Time;
}

export enum OrderType {
  Request = 0,
  Order = 1
}
export enum Time {
  Yearly = 0,
  Monthly = 1,
  Weekly = 2,
}

export enum OrderStatus {
  PendingSeller = 0,
  PendingBuyer = 1,
  Processing = 2,
  Ready = 3,
  Pending = 4,
  Shipped = 5,
  Completed = 6,
  Cancelled = 7,
  PaymentFailed = 8,
  Delivered = 9
}

export enum ReportMetricType {
  Revenue = 0,
  Count = 1
}
