import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuditDto } from '../models/audit-models/audit.dto';
import { GenericResponseDto } from '../models/user-models/generic-response.dto';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  private baseUrl = `${environment.apiUrl}/api/Audit`;
  constructor(private http: HttpClient) {}

  getAuditData(): Observable<AuditDto[]> {
    return this.http
      .get<GenericResponseDto<AuditDto[]>>(this.baseUrl)
      .pipe(map((response) => response.data));
  }
}
