import { Injectable } from '@angular/core';
import { Service } from '../models/service-models/service.dto';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GenericRequestModel } from '../models/generic-request-Dto';
import { PaginationDto } from '../models/pagination-Dto';

@Injectable({
  providedIn: 'root'
})

export class ServiceService {
  private baseUrl = 'http://localhost:5250/api/service';
  private services: Service[] = [];

  constructor(private http:HttpClient) { }

  getAllServices(page: number = 1, size: number = 10, searchTerm?: string, sellerName?: string): Observable<GenericRequestModel<PaginationDto<Service>>> {
    let url = `${this.baseUrl}?page=${page}&size=${size}`;
    if (searchTerm) {
      url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }
    if (sellerName) {
      url += `&sellerName=${encodeURIComponent(sellerName)}`;
    }
    return this.http.get<GenericRequestModel<PaginationDto<Service>>>(url);
  }

  getServiceById(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.baseUrl}/${id}`);
  }

  getSellerServices(sellerId: string, page: number = 1, size: number = 10, searchTerm?: string): Observable<GenericRequestModel<PaginationDto<Service>>> {
    let url = `${this.baseUrl}/seller/${sellerId}?page=${page}&size=${size}`;
    if (searchTerm) {
      url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }
    return this.http.get<GenericRequestModel<PaginationDto<Service>>>(url);
  }


  getMyServices(page: number = 1, size: number = 10): Observable<GenericRequestModel<PaginationDto<Service>>>  {
    return this.http.get<GenericRequestModel<PaginationDto<Service>>>(`${this.baseUrl}/mine?page=${page}&size=${size}`);
  }

  addService(service: Service): Observable<Service> {
    return this.http.post<Service>(`${this.baseUrl}`, service);
  }

  uploadServiceImage(file: File, serviceId: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/${serviceId}/upload-image`, formData);
  }

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/upload-image`, formData);
  }

  // Replace updateService with submitEditRequest
  submitEditRequest(serviceId: number, editRequest: any): Observable<any> {
    return this.http.post<any>(`http://localhost:5250/api/ServiceEditRequest/${serviceId}`, editRequest);
  }

  // Submit reactivation request for rejected services
  submitReactivationRequest(serviceId: number, reactivationRequest: any): Observable<any> {
    return this.http.post<any>(`http://localhost:5250/api/ServiceEditRequest/reactivate/${serviceId}`, reactivationRequest);
  }

  deleteService(id: number): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${id}/delete`, {});
  }

  restoreService(id: number): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${id}/restore`, {});
  }

  getPendingServices(page: number = 1, size: number = 10): Observable<GenericRequestModel<PaginationDto<Service>>> {
    return this.http.get<GenericRequestModel<PaginationDto<Service>>>(`${this.baseUrl}/admin/pending?page=${page}&size=${size}`);
  }

  getAllServicesForAdmin(page: number = 1, size: number = 10, includeBlockedSellers?: boolean, includeDeletedSellers?: boolean, includeDeletedServices?: boolean): Observable<GenericRequestModel<PaginationDto<Service>>> {
    let url = `${this.baseUrl}/admin/all?page=${page}&size=${size}`;
    if (includeBlockedSellers !== undefined) {
      url += `&includeBlockedSellers=${includeBlockedSellers}`;
    }
    if (includeDeletedSellers !== undefined) {
      url += `&includeDeletedSellers=${includeDeletedSellers}`;
    }
    if (includeDeletedServices !== undefined) {
      url += `&includeDeletedServices=${includeDeletedServices}`;
    }
    return this.http.get<GenericRequestModel<PaginationDto<Service>>>(url);
  }

  approveService(serviceId: number): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/approve/${serviceId}`, true);
  }

  rejectService(serviceId: number): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/approve/${serviceId}`, false);
  }

}
