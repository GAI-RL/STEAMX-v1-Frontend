import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { GoogleAuthService } from '../../../core/services/google-auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent implements OnInit, AfterViewInit {
  
  @ViewChild('googleButton') googleButton!: ElementRef;

  formData = {
    full_name: '',
    email: '',
    password: '',
    confirm_password: ''
  };

  loading = false;
  error = '';
  success = false;
  termsAccepted = false;
    isGoogleLoginLoading: boolean = false;
  sendError: string ="";

  constructor(
    private authService: AuthService,
    private googleAuthService: GoogleAuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // Add scroll animation class
    setTimeout(() => {
      document.querySelectorAll('.animate-on-scroll').forEach(el => {
        el.classList.add('visible');
      });
    }, 100);
  }

  ngAfterViewInit(): void {
    // Initialize Google Sign-In button
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

  setTimeout(() => {
    this.googleAuthService.handleGoogleLogin(credential).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.isGoogleLoginLoading = false;
          this.router.navigate(['/chat']);
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.isGoogleLoginLoading = false;

          // Handle offline explicitly
          if (err.status === 0 || err.message?.includes('INTERNET_DISCONNECTED')) {
            this.sendError = 'No internet connection. Please check your network.';
          } else {
            this.sendError = err.message || 'Google login failed. Please try again.';
            console.error('Login error:', err);
              this.cdr.detectChanges();

          }
        });
      }
    });
  }, 0);
}


  // Clear error when user starts typing
  clearError(): void {
    if (this.error) {
      this.error = '';
    }
  }

  // Scroll to error message
  private scrollToError(): void {
    setTimeout(() => {
      const errorElement = document.querySelector('.error-alert');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  onSubmit() {
    console.log('🚀 Form submitted! Starting validation...');
    console.log('Form data:', this.formData);
    console.log('Terms accepted:', this.termsAccepted);
    
    // Validation
    if (!this.formData.full_name || !this.formData.email || !this.formData.password || !this.formData.confirm_password) {
      this.error = 'Please fill in all fields';
      this.cdr.detectChanges();
      this.scrollToError();
      return;
    }

    if (this.formData.password.length < 8) {
      this.error = 'Password must be at least 8 characters';
      this.cdr.detectChanges();
      this.scrollToError();
      return;
    }

    if (this.formData.password !== this.formData.confirm_password) {
      this.error = 'Passwords do not match';
      this.cdr.detectChanges();
      this.scrollToError();
      return;
    }

    if (!this.termsAccepted) {
      this.error = 'Please agree to the Terms of Service and Privacy Policy';
      this.cdr.detectChanges();
      this.scrollToError();
      return;
    }

    this.loading = true;
    this.error = '';

    const registerData = {
      full_name: this.formData.full_name,
      email: this.formData.email,
      password: this.formData.password
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = true;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        // Run inside Angular zone to ensure change detection
        this.ngZone.run(() => {
          this.loading = false;
          
          // Comprehensive error logging for debugging
          console.log('═══════════════════════════════════════════');
          console.log('REGISTRATION ERROR DETAILS:');
          console.log('═══════════════════════════════════════════');
          console.log('1. Full error object:', err);
          console.log('2. Error status:', err.status);
          console.log('3. Error statusText:', err.statusText);
          console.log('4. Error body (err.error):', err.error);
          console.log('5. Error detail (err.error?.detail):', err.error?.detail);
          console.log('6. Error message (err.error?.message):', err.error?.message);
          console.log('7. Type of detail:', typeof err.error?.detail);
          console.log('═══════════════════════════════════════════');
          
          // Handle different error response formats
          let errorMessage = '';
          
          if (err.error) {
            // Check for detail field
            if (err.error.detail) {
              if (typeof err.error.detail === 'string') {
                errorMessage = err.error.detail;
              } 
              else if (Array.isArray(err.error.detail)) {
                errorMessage = err.error.detail
                  .map((e: any) => e.msg || e.message || JSON.stringify(e))
                  .join(', ');
              }
              else if (typeof err.error.detail === 'object') {
                errorMessage = Object.values(err.error.detail).join(', ');
              }
            }
            // Check for message field
            else if (err.error.message) {
              errorMessage = err.error.message;
            }
            // Check for error field
            else if (err.error.error) {
              errorMessage = err.error.error;
            }
          }
          
          // If still no error message, use status-based messages
          if (!errorMessage) {
            if (err.status === 400) {
              errorMessage = 'This email is already registered. Please use a different email or try logging in.';
            }
            else if (err.status === 409) {
              errorMessage = 'This email is already registered. Please use a different email or try logging in.';
            }
            else if (err.status === 422) {
              errorMessage = 'Invalid input. Please check your information and try again.';
            }
            else if (err.status === 0) {
              errorMessage = 'Unable to connect to server. Please check your internet connection.';
            }
            else {
              errorMessage = 'Registration failed. Please try again.';
            }
          }
          
          this.error = errorMessage;
          
          console.log('Final displayed error:', this.error);
          console.log('Error variable set, triggering change detection...');
          console.log('═══════════════════════════════════════════');
          
          // Force Angular to detect changes
          this.cdr.detectChanges();
          
          // Scroll to error message after a brief delay to ensure rendering
          setTimeout(() => {
            this.scrollToError();
          }, 50);
        });
      }
    });
  }
}