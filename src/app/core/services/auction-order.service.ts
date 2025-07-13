import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuctionOrderDto, OrderStatus } from '../models/auction-models/auction-order-dto';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuctionOrderService {
  private readonly baseUrl = `${environment.apiUrl}/api/AuctionOrder`;

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

  // New: Update address/order info fields
  updateOrderAddressInfo(orderId: number, addressForm: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${orderId}/address-info`, addressForm);
  }

  // New: Create Stripe checkout session for auction order
  createStripeCheckoutSession(orderId: number): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/${orderId}/checkout`, 
      {}
    ).pipe(
      catchError(error => {
        console.error('Payment error:', error);
        throw error;
      })
    );
  }
}
