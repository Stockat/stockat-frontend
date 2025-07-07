import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserUpdateDto } from '../models/user-models/user-update.dto';
import { ChangePasswordDto } from '../models/user-models/change-password.dto';
import { UserReadDto } from '../models/user-models/user-read.dto';
import { TokenDto } from '../models/auth-models/auth-response.dto';
import { UserVerificationCreateDto } from '../models/user-models/user-verification-create.dto';
import { UserVerificationReadDto } from '../models/user-models/user-verification-read.dto';
import { UserVerificationUpdateDto } from '../models/user-models/user-verification-update.dto';
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

  // User Verification Endpoints
  getUserVerification(): Observable<{ data: UserVerificationReadDto }> {
    return this.http.get<{ data: UserVerificationReadDto }>('http://localhost:5250/api/UserVerification');
  }

  createUserVerification(dto: UserVerificationCreateDto): Observable<any> {
    const formData = new FormData();
    formData.append('NationalId', dto.nationalId);
    formData.append('Image', dto.image);
    return this.http.post<any>('http://localhost:5250/api/UserVerification', formData);
  }

  updateUserVerification(dto: UserVerificationUpdateDto): Observable<any> {
    const formData = new FormData();
    formData.append('NationalId', dto.nationalId);
    if (dto.image) formData.append('Image', dto.image);
    return this.http.put<any>('http://localhost:5250/api/UserVerification', formData);
  }

  deleteUserVerification(): Observable<any> {
    return this.http.delete<any>('http://localhost:5250/api/UserVerification');
  }

  // Deactivate User
  toggleUserActivation(): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/toggle-activation`, {});
  }

  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}