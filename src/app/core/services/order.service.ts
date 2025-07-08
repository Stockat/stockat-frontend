import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderRequest } from '../models/order-request.model';
import { SellerOrder } from '../models/order-models/seller-order.model';
import { AdminOrder } from '../models/order-models/admin-order.model';
import { GenericResponseDto } from '../models/user-models/generic-response.dto';
import { AnalysisDto, BarChartAnalysisDto, BarChartAnalysisFilterationDto } from '../models/order-models/AnalysisDto';

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
    return this.http.get<{ data: SellerOrder[] }>(`${this.orderUrl}/seller/req`);
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(`${this.orderUrl}/${orderId}`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' }
    });
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

  UpdateRequestOrderWithStripe(request: any): Observable<GenericResponseDto<any>> {
    return this.http.post<GenericResponseDto<any>>(this.orderUrl + '/request/stripe', request);
  }


  //* Analysis
  getorderSales(): Observable<GenericResponseDto<AnalysisDto>> {
    return this.http.get<GenericResponseDto<AnalysisDto>>(`${this.orderUrl}/analysis/orderSales`);
  }
  getOrdersVsStatus(filteration: BarChartAnalysisFilterationDto): Observable<GenericResponseDto<BarChartAnalysisDto>> {

    //const params = new HttpParams();
   /* params.set('type', filteration.type.toString());
    params.set('status', filteration.status.toString());
    params.set('metricType', filteration.metricType.toString());
*/
const params = new HttpParams({ fromObject: filteration as any });
    console.log(params);

    return this.http.get<GenericResponseDto<BarChartAnalysisDto>>(`${this.orderUrl}/analysis/OrdersVsStatus`, { params });
  }

}
