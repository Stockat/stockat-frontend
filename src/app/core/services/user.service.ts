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
import { UserVerificationStatusUpdateDto } from '../models/user-models/user-verification-status-update.dto';
import { CreatePunishmentDto } from '../models/user-models/create-punishment.dto';
import { PunishmentReadDto } from '../models/user-models/punishment-read.dto';
import { PaginatedDto } from '../models/user-models/paginated-dto';
import { GenericResponseDto } from '../models/user-models/generic-response.dto';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:5250/api/User';
  private verificationApiUrl = 'http://localhost:5250/api/UserVerification';
  private punishmentApiUrl = 'http://localhost:5250/api/UserPunishment';

  constructor(private http: HttpClient) {}

  // Regular User Endpoints
  getCurrentUser(): Observable<GenericResponseDto<UserReadDto>> {
    return this.http.get<GenericResponseDto<UserReadDto>>(`${this.apiUrl}`);
  }

  updateUser(dto: UserUpdateDto): Observable<GenericResponseDto<UserReadDto>> {
    return this.http.put<GenericResponseDto<UserReadDto>>(`${this.apiUrl}`, dto);
  }

  updateProfileImage(file: File): Observable<GenericResponseDto<string>> {
    const formData = new FormData();
    formData.append('ProfileImage', file);
    return this.http.put<GenericResponseDto<string>>(`${this.apiUrl}/profile-image`, formData);
  }

  changePassword(dto: ChangePasswordDto): Observable<GenericResponseDto<string>> {
    return this.http.put<GenericResponseDto<string>>(`${this.apiUrl}/change-password`, dto);
  }

  toggleUserActivation(): Observable<GenericResponseDto<string>> {
    return this.http.put<GenericResponseDto<string>>(`${this.apiUrl}/toggle-activation`, {});
  }

  getUserById(userId: string): Observable<GenericResponseDto<UserReadDto>> {
    return this.http.get<GenericResponseDto<UserReadDto>>(`${this.apiUrl}/${userId}`);
  }

  // Admin User Management Endpoints
  getAllUsers(
    page: number = 1, 
    size: number = 10, 
    searchTerm?: string, 
    isActive?: boolean, 
    isVerified?: boolean,
    isBlocked?: boolean
  ): Observable<GenericResponseDto<PaginatedDto<UserReadDto[]>>> {
    let params = `page=${page}&size=${size}`;
    if (searchTerm) params += `&searchTerm=${searchTerm}`;
    if (isActive !== undefined) params += `&isActive=${isActive}`;
    if (isVerified !== undefined) params += `&isVerified=${isVerified}`;
    if (isBlocked !== undefined) params += `&isBlocked=${isBlocked}`;
    
    return this.http.get<GenericResponseDto<PaginatedDto<UserReadDto[]>>>(`${this.apiUrl}/admin/all?${params}`);
  }

  getUserWithDetails(userId: string): Observable<GenericResponseDto<UserReadDto>> {
    return this.http.get<GenericResponseDto<UserReadDto>>(`${this.apiUrl}/admin/${userId}/details`);
  }

  deactivateUser(userId: string): Observable<GenericResponseDto<string>> {
    return this.http.put<GenericResponseDto<string>>(`${this.apiUrl}/admin/${userId}/deactivate`, {});
  }

  activateUser(userId: string): Observable<GenericResponseDto<string>> {
    return this.http.put<GenericResponseDto<string>>(`${this.apiUrl}/admin/${userId}/activate`, {});
  }

  // User Verification Endpoints
  getUserVerification(): Observable<GenericResponseDto<UserVerificationReadDto>> {
    return this.http.get<GenericResponseDto<UserVerificationReadDto>>(`${this.verificationApiUrl}`);
  }

  createUserVerification(dto: UserVerificationCreateDto): Observable<GenericResponseDto<UserVerificationReadDto>> {
    const formData = new FormData();
    formData.append('NationalId', dto.nationalId);
    formData.append('Image', dto.image);
    return this.http.post<GenericResponseDto<UserVerificationReadDto>>(`${this.verificationApiUrl}`, formData);
  }

  updateUserVerification(dto: UserVerificationUpdateDto): Observable<GenericResponseDto<UserVerificationReadDto>> {
    const formData = new FormData();
    formData.append('NationalId', dto.nationalId);
    if (dto.image) formData.append('Image', dto.image);
    return this.http.put<GenericResponseDto<UserVerificationReadDto>>(`${this.verificationApiUrl}`, formData);
  }

  deleteUserVerification(): Observable<GenericResponseDto<string>> {
    return this.http.delete<GenericResponseDto<string>>(`${this.verificationApiUrl}`);
  }

  // Admin User Verification Endpoints
  getPendingVerifications(page: number = 1, size: number = 10, searchTerm?: string): Observable<GenericResponseDto<PaginatedDto<UserVerificationReadDto[]>>> {
    let params = `page=${page}&size=${size}`;
    if (searchTerm) params += `&searchTerm=${searchTerm}`;
    return this.http.get<GenericResponseDto<PaginatedDto<UserVerificationReadDto[]>>>(`${this.verificationApiUrl}/admin/pending?${params}`);
  }

  getVerificationStatistics(): Observable<GenericResponseDto<any>> {
    return this.http.get<GenericResponseDto<any>>(`${this.verificationApiUrl}/admin/statistics`);
  }

  updateVerificationStatus(dto: UserVerificationStatusUpdateDto): Observable<GenericResponseDto<UserVerificationReadDto>> {
    return this.http.put<GenericResponseDto<UserVerificationReadDto>>(`${this.verificationApiUrl}/status`, dto);
  }

  // User Punishment Endpoints
  createPunishment(dto: CreatePunishmentDto): Observable<GenericResponseDto<PunishmentReadDto>> {
    return this.http.post<GenericResponseDto<PunishmentReadDto>>(`${this.punishmentApiUrl}`, dto);
  }

  getPunishmentById(id: number): Observable<GenericResponseDto<PunishmentReadDto>> {
    return this.http.get<GenericResponseDto<PunishmentReadDto>>(`${this.punishmentApiUrl}/${id}`);
  }

  getUserPunishments(userId: string): Observable<GenericResponseDto<PunishmentReadDto[]>> {
    return this.http.get<GenericResponseDto<PunishmentReadDto[]>>(`${this.punishmentApiUrl}/user/${userId}`);
  }

  getAllPunishments(page: number = 1, size: number = 10, searchTerm?: string): Observable<GenericResponseDto<PunishmentReadDto[]>> {
    let params = `page=${page}&size=${size}`;
    if (searchTerm) params += `&searchTerm=${searchTerm}`;
    return this.http.get<GenericResponseDto<PunishmentReadDto[]>>(`${this.punishmentApiUrl}?${params}`);
  }

  removePunishment(id: number): Observable<GenericResponseDto<string>> {
    return this.http.delete<GenericResponseDto<string>>(`${this.punishmentApiUrl}/${id}`);
  }

  checkIfUserBlocked(userId: string): Observable<GenericResponseDto<boolean>> {
    return this.http.get<GenericResponseDto<boolean>>(`${this.punishmentApiUrl}/check/${userId}`);
  }

  getCurrentPunishment(userId: string): Observable<GenericResponseDto<PunishmentReadDto>> {
    return this.http.get<GenericResponseDto<PunishmentReadDto>>(`${this.punishmentApiUrl}/current/${userId}`);
  }

  getPunishmentStatistics(): Observable<GenericResponseDto<any>> {
    return this.http.get<GenericResponseDto<any>>(`${this.punishmentApiUrl}/statistics`);
  }

  getActivePunishments(page: number = 1, size: number = 10): Observable<GenericResponseDto<PaginatedDto<PunishmentReadDto[]>>> {
    return this.http.get<GenericResponseDto<PaginatedDto<PunishmentReadDto[]>>>(`${this.punishmentApiUrl}/active?page=${page}&size=${size}`);
  }

  getPunishmentsByType(type: string, page: number = 1, size: number = 10): Observable<GenericResponseDto<PaginatedDto<PunishmentReadDto[]>>> {
    return this.http.get<GenericResponseDto<PaginatedDto<PunishmentReadDto[]>>>(`${this.punishmentApiUrl}/type/${type}?page=${page}&size=${size}`);
  }

  getUserStatistics(): Observable<GenericResponseDto<any>> {
    return this.http.get<GenericResponseDto<any>>(`${this.apiUrl}/admin/statistics`);
  }

  getAllVerifications(page: number = 1, size: number = 10, status?: string, searchTerm?: string): Observable<GenericResponseDto<PaginatedDto<UserVerificationReadDto[]>>> {
    let params = `page=${page}&size=${size}`;
    if (status) params += `&status=${status}`;
    if (searchTerm) params += `&searchTerm=${searchTerm}`;
    return this.http.get<GenericResponseDto<PaginatedDto<UserVerificationReadDto[]>>>(`${this.verificationApiUrl}/admin/all?${params}`);
  }

  upgradeToSeller(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/upgrade-to-seller`, {});
  }
}
