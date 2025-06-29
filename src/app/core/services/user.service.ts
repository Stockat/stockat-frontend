import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserReadDto {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  aboutMe?: string;
  profileImageUrl?: string;
  isApproved: boolean;
  isDeleted: boolean;
  needsVerification: boolean;
  roles: string[]; 
}


export interface UserUpdateDto {
  firstName: string;
  lastName: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  aboutMe?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UserImageUpdateDto {
  profileImage: File;
}

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