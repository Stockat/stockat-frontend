import { Injectable } from '@angular/core';
import { Service } from '../models/service-models/service.dto';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class ServiceService {
  private baseUrl = 'http://localhost:5250/api/service';
  private services: Service[] = [];

  constructor(private http:HttpClient) { }

  getAllServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.baseUrl}`);
  }

  getServiceById(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.baseUrl}/${id}`);
  }

  getSellerServices(sellerId: string | null): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.baseUrl}/seller/${sellerId}`);
  }

  getMyServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.baseUrl}/mine`);
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

  updateService(service: Service): Observable<Service> {
    return this.http.patch<Service>(`${this.baseUrl}/${service.id}`, service);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

}
