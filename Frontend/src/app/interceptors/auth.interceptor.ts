import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Token varsa her isteğe Bearer header ekle
  const clonedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 Unauthorized — token geçersiz veya süresi dolmuş
      if (error.status === 401) {
        // localStorage temizle ve login sayfasına yönlendir
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        authService.currentUser.set(null);
        router.navigate(['/login'], {
          queryParams: { reason: 'session_expired' }
        });
      }
      // 403 Forbidden — yetkisiz erişim (rol hatası)
      if (error.status === 403) {
        router.navigate(['/dashboard']);
      }
      return throwError(() => error);
    })
  );
};
