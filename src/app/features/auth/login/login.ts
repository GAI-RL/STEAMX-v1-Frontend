import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { GoogleAuthService } from '../../../core/services/google-auth.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit, AfterViewInit {
  
  @ViewChild('googleButton') googleButton!: ElementRef;

  credentials = {
    email: '',
    password: ''
  };

  loading = false;
  error = '';
  isGoogleLoginLoading: boolean = false;
  sendError: string = "";

  constructor(
    private authService: AuthService,
    private googleAuthService: GoogleAuthService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      document.querySelectorAll('.animate-on-scroll').forEach(el => {
        el.classList.add('visible');
      });
    }, 100);
  }

  ngAfterViewInit(): void {
    if (this.googleButton) {
      this.googleAuthService.initializeGoogleSignIn(
        this.googleButton.nativeElement,
        (credential) => this.onGoogleCredential(credential)
      );
    }
  }

  onGoogleCredential(credential: string): void {
    this.isGoogleLoginLoading = true;
    this.sendError = '';
    this.cdr.detectChanges();

    // Use the authService.googleLogin method
    this.authService.googleLogin(credential).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.isGoogleLoginLoading = false;
          console.log('Google login successful:', response);
          this.router.navigate(['/chat']);
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.isGoogleLoginLoading = false;
          console.error('Google login error:', err);
          this.sendError = err.error?.detail || 'Google login failed. Please try again.';
          this.cdr.detectChanges();
        });
      }
    });
  }

  onSubmit() {
    if (!this.credentials.email || !this.credentials.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate(['/chat']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail || 'Login failed. Please check your credentials.';
        console.error('Login error:', err);
      }
    });
  }
}