import { Injectable } from '@angular/core';
import { Service } from '../models/service-models/service.dto';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ServiceRequestDto } from '../models/service-models/service-request.dto';
import { PaginationDto } from '../models/pagination-Dto';
import { GenericRequestModel } from '../models/generic-request-Dto';

@Injectable({
  providedIn: 'root'
})

export class ServiceRequestService {
  private baseUrl = 'http://localhost:5250/api/ServiceRequest';

  constructor(private http: HttpClient) { }

  createRequest(body:any) : Observable<any> {
    return this.http.post(`${this.baseUrl}`, body);
  }

  getSellerRequestsByServiceId(serviceId: number, page: number = 1, size: number = 10): Observable<GenericRequestModel<PaginationDto<ServiceRequestDto>>> { // for seller
    return this.http.get<GenericRequestModel<PaginationDto<ServiceRequestDto>>>(`${this.baseUrl}/${serviceId}/incoming?page=${page}&size=${size}`);
  }

  getBuyerRequests(page: number = 1, size: number = 10): Observable<GenericRequestModel<PaginationDto<ServiceRequestDto>>> { // for buyer
    return this.http.get<GenericRequestModel<PaginationDto<ServiceRequestDto>>>(`${this.baseUrl}/mine?page=${page}&size=${size}`);
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
    return this.http.patch(`${this.baseUrl}/${requestId}/status/update`, { status:status });
  }

  getServiceIdsWithPendingRequests(): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/buyer/pending-services`);
  }

  cancelRequest(requestId: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${requestId}/buyer-cancel`, {});
  }

  getAllRequestsForAdmin(page: number = 1, size: number = 10, status?: string): Observable<GenericRequestModel<PaginationDto<ServiceRequestDto>>> {
    let url = `${this.baseUrl}/admin/all?page=${page}&size=${size}`;
    if (status !== undefined && status !== null && status !== '') {
      url += `&status=${status}`;
    }
    return this.http.get<GenericRequestModel<PaginationDto<ServiceRequestDto>>>(url);
  }
}
