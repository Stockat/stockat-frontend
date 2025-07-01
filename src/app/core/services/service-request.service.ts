import { Injectable } from '@angular/core';
import { Service } from '../models/service-models/service.dto';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class ServiceRequestService {
  private baseUrl = 'http://localhost:5250/api/ServiceRequest';

  constructor(private http: HttpClient) { }

  createRequest(body:any) : Observable<any> {
    return this.http.post(`${this.baseUrl}`, body);
  }

  getSellerRequestsByServiceId(serviceId: number): Observable<any[]> { // for seller
    return this.http.get<any[]>(`${this.baseUrl}/${serviceId}/incoming`);
  }

  getBuyerRequests(): Observable<any[]> { // for buyer
    return this.http.get<any[]>(`${this.baseUrl}/mine`);
  }

  getRequestById(requestId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${requestId}`);
  }

  updateBuyerStatus(requestId: number, status: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${requestId}/status`, {status});
  }

  setSellerOffer(requestId: number, offer: object): Observable<any> {
    // Send offer fields at root, not wrapped in { offer }
    return this.http.patch(`${this.baseUrl}/${requestId}/seller-offer`, offer);
  }

  updateRequestStatus(requestId: number, status: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${requestId}/status/update`, { status });
  }

  getServiceIdsWithPendingRequests(): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/buyer/pending-services`);
  }
}
