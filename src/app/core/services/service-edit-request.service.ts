import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceEditRequestDto } from '../models/service-models/service-edit-request.dto';
import { environment } from '../../../environments/environment';

interface PaginatedDto<T> {
  page: number;
  size: number;
  count: number;
  paginatedData: T;
}

interface GenericResponseDto<T> {
  status: number;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceEditRequestService {
  private baseUrl = `${environment.apiUrl}/api/ServiceEditRequest`;

  constructor(private http: HttpClient) {}

  getPendingRequests(page: number = 1, size: number = 10): Observable<GenericResponseDto<PaginatedDto<ServiceEditRequestDto[]>>> {
    return this.http.get<GenericResponseDto<PaginatedDto<ServiceEditRequestDto[]>>>(`${this.baseUrl}/pending?page=${page}&size=${size}`);
  }

  getApprovedRequests(page: number = 1, size: number = 10): Observable<GenericResponseDto<PaginatedDto<ServiceEditRequestDto[]>>> {
    return this.http.get<GenericResponseDto<PaginatedDto<ServiceEditRequestDto[]>>>(`${this.baseUrl}/approved?page=${page}&size=${size}`);
  }

  getRejectedRequests(page: number = 1, size: number = 10): Observable<GenericResponseDto<PaginatedDto<ServiceEditRequestDto[]>>> {
    return this.http.get<GenericResponseDto<PaginatedDto<ServiceEditRequestDto[]>>>(`${this.baseUrl}/rejected?page=${page}&size=${size}`);
  }

  getStatistics(): Observable<GenericResponseDto<any>> {
    console.log('Calling statistics endpoint...');
    return this.http.get<GenericResponseDto<any>>(`${this.baseUrl}/statistics`);
  }

  approveRequest(requestId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${requestId}/approve`, {});
  }

  rejectRequest(requestId: number, note: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${requestId}/reject`, { note });
  }

  // Manual trigger for deferred edit application (for testing)
  applyDeferredEdits(serviceId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/apply-deferred/${serviceId}`, {});
  }

  // Check deferred edit status
  getDeferredEditStatus(serviceId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/deferred-status/${serviceId}`);
  }
}
