import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // External OCR service must not receive JWT (avoids CORS preflight issues).
  if (req.url.startsWith(environment.ocrApiUrl)) {
    return next(req);
  }

  const authService = inject(AuthService);
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
        authService.logout();  // Log user out
        router.navigate(['/login']);  // Send to login page
      }
      return throwError(() => error);
    })
  );
};