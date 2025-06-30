import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserUpdateDto } from '../models/user-models/user-update.dto';
import { ChangePasswordDto } from '../models/user-models/change-password.dto';
import { UserReadDto } from '../models/user-models/user-read.dto';
import { TokenDto } from '../models/auth-models/auth-response.dto';
@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:5250/api/User';

  constructor(private http: HttpClient) {}

  getCurrentUser(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }

  updateUser(dto: UserUpdateDto): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}`, dto);
  }

  updateProfileImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('ProfileImage', file);
    return this.http.put<any>(`${this.apiUrl}/profile-image`, formData);
  }

  changePassword(dto: ChangePasswordDto): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/change-password`, dto);
  }
} 