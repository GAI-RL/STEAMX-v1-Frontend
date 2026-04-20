import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, EMPTY, throwError } from 'rxjs';
import { SessionService } from '../services/session-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
    const sessionService = inject(SessionService);
  const router = inject(Router);
  const token = authService.getToken();

  // If we have a token, add it to the request
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`  // Add JWT token to header
      }
    });
  }

  // Send the request and handle errors
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If we get 401 (Unauthorized), token expired or invalid
      if (error.status === 401) {
        // authService.logout();  // Log user out
        // router.navigate(['/login']);  // Send to login page
         sessionService.triggerSessionExpired()      // ← no inline banner
        return EMPTY;   
      }
      return throwError(() => error);
    })
  );
};