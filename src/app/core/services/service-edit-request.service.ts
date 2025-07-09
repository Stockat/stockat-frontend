import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceEditRequestDto } from '../models/service-models/service-edit-request.dto';

@Injectable({
  providedIn: 'root'
})
export class ServiceEditRequestService {
  private baseUrl = 'http://localhost:5250/api/ServiceEditRequest';

  constructor(private http: HttpClient) {}

  getPendingRequests(): Observable<ServiceEditRequestDto[]> {
    return this.http.get<ServiceEditRequestDto[]>(`${this.baseUrl}/pending`);
  }
  // Add more methods for approve/reject as needed
}
