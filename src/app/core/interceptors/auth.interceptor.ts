import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('accessToken');
    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(authReq).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        this.isRefreshing = false;
        this.handleLogout();
        return throwError(() => new Error('No refresh token available'));
      }
      return this.http.post<any>('/api/token/refresh', { refreshToken }).pipe(
        switchMap((response) => {
          this.isRefreshing = false;
          const newToken = response?.token || response?.accessToken;
          const newRefreshToken = response?.refreshToken;
          if (newToken) localStorage.setItem('accessToken', newToken);
          if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
          this.refreshTokenSubject.next(newToken);
          return next.handle(
            request.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
          );
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.handleLogout();
          return throwError(() => err);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => next.handle(
          request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        ))
      );
    }
  }

  private handleLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/login']);
  }
} 