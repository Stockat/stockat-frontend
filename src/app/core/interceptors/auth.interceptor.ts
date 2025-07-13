import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
  HttpClient
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenDto } from '../models/auth-models/auth-response.dto';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = localStorage.getItem('accessToken');
    let authReq = req;

    if (accessToken) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${accessToken}` }
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

      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      console.log('Refreshing token...');
      if (!accessToken || !refreshToken) {
        this.isRefreshing = false;
        this.handleLogout();
        return throwError(() => new Error('Missing token(s)'));
      }

      const tokenDto = { accessToken, refreshToken };

      return this.http.post<TokenDto>(`${environment.apiUrl}/api/token/refresh`, tokenDto).pipe(
        switchMap((response) => {
          this.isRefreshing = false;

          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);

          this.refreshTokenSubject.next(response.accessToken);

          return next.handle(
            request.clone({
              setHeaders: { Authorization: `Bearer ${response.accessToken}` }
            })
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
        switchMap(token =>
          next.handle(
            request.clone({
              setHeaders: { Authorization: `Bearer ${token}` }
            })
          )
        )
      );
    }
  }

  private handleLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/login']);
  }
}

