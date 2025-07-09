import { OrderStatus } from "./AnalysisDto";

export interface UpdateReqDto {
  id: number;
  status: OrderStatus;
  price: number;
  deliveryDate: Date;
}
