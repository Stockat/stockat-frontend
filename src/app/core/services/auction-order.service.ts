import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuctionOrderDto, OrderStatus } from '../models/auction-models/auction-order-dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuctionOrderService {
  private readonly baseUrl = 'http://localhost:5250/api/AuctionOrder';

  constructor(private http: HttpClient) {}

  getUserOrders(userId: string): Observable<AuctionOrderDto[]> {
    return this.http.get<AuctionOrderDto[]>(`${this.baseUrl}/user/${userId}`);
  }

  getAllOrders(): Observable<AuctionOrderDto[]> {
    return this.http.get<AuctionOrderDto[]>(this.baseUrl);
  }

  updateOrderStatus(orderId: number, newStatus: OrderStatus): Observable<any> {
    return this.http.put(`${this.baseUrl}/${orderId}/status`, { status: newStatus });
  }
}
