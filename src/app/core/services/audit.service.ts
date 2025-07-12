import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuditDto } from '../models/audit-models/audit.dto';
import { GenericResponseDto } from '../models/user-models/generic-response.dto';

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  private apiUrl = 'http://localhost:5250/api/Audit';

  constructor(private http: HttpClient) {}

  getAuditData(): Observable<AuditDto[]> {
    return this.http
      .get<GenericResponseDto<AuditDto[]>>(this.apiUrl)
      .pipe(map((response) => response.data));
  }
}
