import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderRequest } from '../models/order-request.model';
import { SellerOrder } from '../models/order-models/seller-order.model';
import { AdminOrder } from '../models/order-models/admin-order.model';

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

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(`${this.orderUrl}/${orderId}`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 