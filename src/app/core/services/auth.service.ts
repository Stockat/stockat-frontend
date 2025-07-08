import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { UserForAuthenticationDto } from '../models/auth-models/user-for-authentication.dto';
import { UserForRegistrationDto } from '../models/auth-models/user-for-registration.dto';
import { AuthResponseDto, TokenDto } from '../models/auth-models/auth-response.dto';
import { ExternalAuthDto } from '../models/auth-models/external-auth.dto';
import { ForgotPasswordDto } from '../models/auth-models/forgot-password.dto';
import { ResetPasswordDto } from '../models/auth-models/reset-password.dto';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5250/api/authentication';
  private tokenUrl = 'http://localhost:5250/api/token';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  register(data: UserForRegistrationDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(data: UserForAuthenticationDto): Observable<AuthResponseDto> {
    return new Observable<AuthResponseDto>(observer => {
      this.http.post<AuthResponseDto>(`${this.apiUrl}/login`, data).subscribe({
        next: (res) => {
          console.log(res); 
          observer.next(res);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  googleLogin(idToken: string): Observable<AuthResponseDto> {
    return new Observable<AuthResponseDto>(observer => {
      this.http.post<AuthResponseDto>(`${this.apiUrl}/googleLogin`, { provider: 'GOOGLE', idToken }).subscribe({
        next: (res) => {
          observer.next(res);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  confirmEmail(userId: string, token: string): Observable<any> {
    const params = new HttpParams().set('userId', userId).set('token', token);
    return this.http.get(`${this.apiUrl}/confirmEmail`, { params });
  }

  forgotPassword(dto: ForgotPasswordDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgotPassword`, dto);
  }

  resetPassword(dto: ResetPasswordDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/resetPassword`, dto);
  }

  refreshToken(tokenDto: TokenDto): Observable<TokenDto> {
    return this.http.post<TokenDto>(`${this.tokenUrl}/refresh`, tokenDto);
  }

  logout(): Observable<any> {
    return new Observable<any>(observer => {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
        next: (res) => {
          this.clearTokens();
          this.router.navigate(['/login']);
          observer.next(res);
          observer.complete();
        },
        error: (err) => {
          this.clearTokens();
          this.router.navigate(['/login']);
          observer.error(err);
        }
      });
    });
  }

  setTokens(token: TokenDto) {
    localStorage.setItem('accessToken', token.accessToken);
    localStorage.setItem('refreshToken', token.refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  externalLogin(externalAuth: ExternalAuthDto): Observable<AuthResponseDto> {
    return new Observable<AuthResponseDto>(observer => {
      this.http.post<AuthResponseDto>(`${this.apiUrl}/googleLogin`, externalAuth).subscribe({
        next: (res) => {
          if (res.token) {
            this.setTokens(res.token);
          }
          observer.next(res);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  getCurrentUserId(): string | null {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      console.log('Decoded JWT:', decoded);
      console.log('Current user ID:', decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']);
      return decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || null;
    } catch {
      return null;
    }
  }

  getCurrentUserRoles(): string[] {
    const token = localStorage.getItem('accessToken');
    if (!token) return [];
    try {
      const decoded: any = jwtDecode(token);
      const roles = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      return Array.isArray(roles) ? roles : [roles].filter(Boolean);
    } catch {
      return [];
    }
  }

  isAdmin(): boolean {
    return this.getCurrentUserRoles().includes('Admin');
  }

  isSeller(): boolean {
    return this.getCurrentUserRoles().includes('Seller');
  }
}
