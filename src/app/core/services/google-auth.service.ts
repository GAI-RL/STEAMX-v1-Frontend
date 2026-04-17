import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

 import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
    isLoading: boolean = false;
  sendError: string ="";
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  initializeGoogleSignIn(element: HTMLElement, onSuccess: (credential: string) => void) {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '1029552044709-ddm5ejh52929u89bbuj9e7m19q74d8ao.apps.googleusercontent.com', // Replace with your actual Client ID
        callback: (response: any) => {
          onSuccess(response.credential);
        }
      });

      google.accounts.id.renderButton(
        element,
        {
          theme: 'outline',
          size: 'large',
          width: element.offsetWidth,
          text: 'continue_with'
        }
      );
    }
  }

  // handleGoogleLogin(credential: string) {
  //   this.authService.googleLogin(credential).subscribe({
  //     next: (response) => {
  //       console.log('Google login successful', response);
  //       this.router.navigate(['/chat']);
  //     },
  //     error: (err) => {
  //       console.error('Google login error:', err);
  //       alert('Google login failed: ' + (err.error?.detail || 'Unknown error'));
  //     }
  //   });
  // }

 handleGoogleLogin(credential: string): Observable<any> {
  return this.authService.googleLogin(credential).pipe(
    catchError((err) => {
      if (err.status === 521) {
        return throwError(() => ({ message: 'Web Server is currently down. Please try again later.' }));
      } else if (err.status === 0) {
        const isOnline = navigator.onLine;
        if (isOnline) {
          return throwError(() => ({ message: 'Web Server is currently down. Please try again later.' }));
        } else {
          return throwError(() => ({ message: 'No internet connection. Please check your network.' }));
        }
      }
      return throwError(() => ({ message: err.error?.detail || 'Google login failed. Please try again.' }));
    }),
    timeout(10000),
    catchError((err) => {
      if (err.name === 'TimeoutError') {
        return throwError(() => ({ message: 'Server is currently down. Please try again later.' }));
      }
      return throwError(() => err);
    })
  );
}
}