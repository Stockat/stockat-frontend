import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServiceRequestUpdateService {

  private baseUrl = 'http://localhost:5250/api/ServiceRequestUpdate';
  constructor(private http:HttpClient) { }

  createUpdate(requestId: number, body: any) {
    return this.http.post(`${this.baseUrl}/${requestId}`, body);
  }

  getUpdateById(id: number) {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  getUpdatesByRequestId(requestId: number) {
    return this.http.get(`${this.baseUrl}/request/${requestId}`);
  }

  cancelUpdate(id: number) {
    return this.http.patch(`${this.baseUrl}/${id}/cancel`, {});
  }

  approveUpdate(id: number, approve:boolean) {
    return this.http.patch(`${this.baseUrl}/seller-approval/${id}`, {approved: approve});
  }

}
