import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderRequest } from '../models/order-request.model';
import { SellerOrder } from '../models/order-models/seller-order.model';
import { AdminOrder } from '../models/order-models/admin-order.model';
import { GenericResponseDto } from '../models/user-models/generic-response.dto';
import {
  AnalysisDto,
  BarChartAnalysisDto,
  BarChartAnalysisFilterationDto,
} from '../models/order-models/AnalysisDto';
import { UpdateReqDto } from '../models/order-models/UpdateReqDto';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly orderUrl = 'http://localhost:5250/api/Order';

  constructor(private http: HttpClient) {}

  placeOrder(order: OrderRequest): Observable<any> {
    return this.http.post(this.orderUrl, order);
  }

  getSellerOrders(): Observable<{ data: SellerOrder[] }> {
    return this.http.get<{ data: SellerOrder[] }>(`${this.orderUrl}/seller`);
  }

  getAdminOrders(): Observable<{ data: AdminOrder[] }> {
    return this.http.get<{ data: AdminOrder[] }>(`${this.orderUrl}/admin`);
  }

  getSellerRequestOrders(): Observable<{ data: SellerOrder[] }> {
    return this.http.get<{ data: SellerOrder[] }>(
      `${this.orderUrl}/seller/req`
    );
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(
      `${this.orderUrl}/${orderId}`,
      JSON.stringify(status),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  updateRequestOrder(
    orderId: number,
    updateReqDto: UpdateReqDto
  ): Observable<any> {
    updateReqDto.id = orderId;
    return this.http.put(
      `${this.orderUrl}/request/${orderId}`,
      JSON.stringify(updateReqDto),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  getBuyerOrders(): Observable<{ data: SellerOrder[] }> {
    return this.http.get<{ data: SellerOrder[] }>(`${this.orderUrl}/user`);
  }

  getBuyerRequestOrders(): Observable<{ data: SellerOrder[] }> {
    return this.http.get<{ data: SellerOrder[] }>(`${this.orderUrl}/user/req`);
  }

  placeRequestOrder(request: any): Observable<any> {
    return this.http.post(this.orderUrl + '/request', request);
  }

  UpdateRequestOrderWithStripe(
    request: any
  ): Observable<GenericResponseDto<any>> {
    return this.http.post<GenericResponseDto<any>>(
      this.orderUrl + '/request/stripe',
      request
    );
  }

  //* Analysis
  getorderSales(): Observable<GenericResponseDto<AnalysisDto>> {
    return this.http.get<GenericResponseDto<AnalysisDto>>(
      `${this.orderUrl}/analysis/orderSales`
    );
  }
  getorderPayment(
    filteration: BarChartAnalysisFilterationDto
  ): Observable<GenericResponseDto<BarChartAnalysisDto>> {
    const params = new HttpParams({ fromObject: filteration as any });
    return this.http.get<GenericResponseDto<BarChartAnalysisDto>>(
      `${this.orderUrl}/analysis/orderPayment`,
      { params }
    );
  }
  getOrdersVsStatus(
    filteration: BarChartAnalysisFilterationDto
  ): Observable<GenericResponseDto<BarChartAnalysisDto>> {
    const params = new HttpParams({ fromObject: filteration as any });
    console.log(params);

    return this.http.get<GenericResponseDto<BarChartAnalysisDto>>(
      `${this.orderUrl}/analysis/OrdersVsStatus`,
      { params }
    );
  }

  getOrderSummary(): Observable<GenericResponseDto<[string, number][]>> {
    return this.http.get<GenericResponseDto<[string, number][]>>(
      `${this.orderUrl}/analysis/OrderSummary`
    );
  }
}
