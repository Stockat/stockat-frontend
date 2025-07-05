import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceRequestUpdateDto } from '../models/service-models/service-request-update.dto';
import { GenericRequestModel } from '../models/generic-request-Dto';
import { PaginationDto } from '../models/pagination-Dto';

@Injectable({
  providedIn: 'root'
})
export class ServiceRequestUpdateService {

  private baseUrl = 'http://localhost:5250/api/ServiceRequestUpdate';
  constructor(private http:HttpClient) { }

  createUpdate(requestId: number, body: any):  Observable<any> {
    return this.http.post(`${this.baseUrl}/${requestId}`, body);
  }

  getUpdateById(id: number): Observable<ServiceRequestUpdateDto> {
    return this.http.get<ServiceRequestUpdateDto>(`${this.baseUrl}/${id}`);
  }

  getUpdatesByRequestId(requestId: number, page: number = 1, size: number = 10): Observable<GenericRequestModel<PaginationDto<ServiceRequestUpdateDto>>> {
    return this.http.get<GenericRequestModel<PaginationDto<ServiceRequestUpdateDto>>>(`${this.baseUrl}/request/${requestId}?page=${page}&size=${size}`);
  }

  cancelUpdate(id: number) {
    return this.http.patch(`${this.baseUrl}/${id}/cancel`, {});
  }

  approveUpdate(id: number, approve:boolean) {
    return this.http.patch(`${this.baseUrl}/seller-approval/${id}`, {approved: approve});
  }

}
