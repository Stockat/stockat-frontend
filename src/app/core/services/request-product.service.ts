import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SellerOrder } from '../models/order-models/seller-order.model';
import { OrderRequest } from '../models/order-request.model';

@Injectable({
  providedIn: 'root'
})
export class RequestProductService {

  private readonly orderUrl = 'http://localhost:5250/api/Order';

  constructor(private http: HttpClient) {}

  placeOrder(order: OrderRequest): Observable<any> {
    return this.http.post(this.orderUrl, order);
  }

  getSellerOrders(): Observable<{ data: SellerOrder[] }> {
    return this.http.get<{ data: SellerOrder[] }>(`${this.orderUrl}/seller`);
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(`${this.orderUrl}/${orderId}`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
