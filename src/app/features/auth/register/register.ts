import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { GoogleAuthService } from '../../../core/services/google-auth.service';
import { CustomDropdownComponent } from '../../../shared/components/custom-dropdown/custom-dropdown.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CustomDropdownComponent],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent implements OnInit, AfterViewInit {

  @ViewChild('googleButton') googleButton!: ElementRef;

  // ── Existing form data ──────────────────────────
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
  sendError: string = '';

  // ── Step 2 academic data ─────────────────────────────────────
  academicData = {
    province: '',
    grade: '',
    subjectGroup: '',
    medium: '',
    school: '',
    phone: ''
  };

  // ── Step 3 preference data ───────────────────────────────────
  prefData = {
    bio: '',
    emailNotif: true,
    studyReminders: true
  };

  // ── Multi-step state ─────────────────────────────────────────
  currentStep = 1;
  showPassword = false;
  showConfirmPassword = false;
  isGoogleUser = false;
  readonly provinces = [
    'Punjab',
    'Sindh',
    'Khyber Pakhtunkhwa (KPK)',
    'Balochistan',
    'Gilgit-Baltistan',
    'Azad Jammu & Kashmir (AJK)',
    'Islamabad Capital Territory (ICT)'
  ];

  constructor(
    private authService: AuthService,
    private googleAuthService: GoogleAuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
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

  // ── Step navigation ──────────────────────────────────────────
  goStep(n: number): void {
    if (n === 2 && !this.validateStep1()) return;
    this.currentStep = n;
    this.error = '';
  }

  private validateStep1(): boolean {
    if (!this.formData.full_name.trim()) {
      this.error = 'Please enter your full name';
      return false;
    }
    if (!this.formData.email.trim()) {
      this.error = 'Please enter your email';
      return false;
    }
    
    // Only validate password for non-Google users
    if (!this.isGoogleUser) {
      if (this.formData.password.length < 8) {
        this.error = 'Password must be at least 8 characters';
        return false;
      }
      if (this.formData.password !== this.formData.confirm_password) {
        this.error = 'Passwords do not match';
        return false;
      }
    }
    
    return true;
  }



  togglePassword(field: 'pw' | 'cpw'): void {
    if (field === 'pw') this.showPassword = !this.showPassword;
    else this.showConfirmPassword = !this.showConfirmPassword;
  }

  // ── Google auth - fills step 1 and goes to step 2 ────────────
  onGoogleCredential(credential: string): void {
    this.isGoogleLoginLoading = true;
    this.sendError = '';
    this.cdr.detectChanges();

    this.googleAuthService.handleGoogleLogin(credential).subscribe({
      next: (response: any) => {
        this.ngZone.run(() => {
          this.isGoogleLoginLoading = false;
          
          // Auto-fill Step 1 form with Google user data
          if (response?.user) {
            this.formData.full_name = response.user.full_name || response.user.name || '';
            this.formData.email = response.user.email || '';
            
            // Generate dummy password for Google users
            const dummyPassword = 'GoogleAuth_' + Math.random().toString(36).substring(2, 15);
            this.formData.password = dummyPassword;
            this.formData.confirm_password = dummyPassword;
            
            // Mark as Google user to skip password validation
            this.isGoogleUser = true;
          }
          
          // Move to Step 2 instead of navigating to chat
          this.currentStep = 2;
          this.error = '';
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.isGoogleLoginLoading = false;
          this.sendError = err.message || 'Google login failed. Please try again.';
          this.cdr.detectChanges();
        });
      }
    });
  }

  clearError(): void {
    if (this.error) this.error = '';
  }

  private scrollToError(): void {
    setTimeout(() => {
      const errorElement = document.querySelector('.error-alert');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  // ── Final submit ─────────────────────────────────────────
  onSubmit() {
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
      next: () => {
        this.loading = false;
        this.success = true;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.loading = false;

          console.log('═══════════════════════════════════════════');
          console.log('REGISTRATION ERROR DETAILS:');
          console.log('Full error object:', err);
          console.log('Error status:', err.status);
          console.log('Error body:', err.error);
          console.log('═══════════════════════════════════════════');

          let errorMessage = '';

          if (err.error) {
            if (err.error.detail) {
              if (typeof err.error.detail === 'string') {
                errorMessage = err.error.detail;
              } else if (Array.isArray(err.error.detail)) {
                errorMessage = err.error.detail
                  .map((e: any) => e.msg || e.message || JSON.stringify(e))
                  .join(', ');
              } else if (typeof err.error.detail === 'object') {
                errorMessage = Object.values(err.error.detail).join(', ');
              }
            } else if (err.error.message) {
              errorMessage = err.error.message;
            } else if (err.error.error) {
              errorMessage = err.error.error;
            }
          }

          if (!errorMessage) {
            if (err.status === 400 || err.status === 409) {
              errorMessage = 'This email is already registered. Please use a different email or try logging in.';
            } else if (err.status === 422) {
              errorMessage = 'Invalid input. Please check your information and try again.';
            } else if (err.status === 0) {
              errorMessage = 'Unable to connect to server. Please check your internet connection.';
            } else {
              errorMessage = 'Registration failed. Please try again.';
            }
          }

          this.error = errorMessage;
          this.cdr.detectChanges();
          setTimeout(() => this.scrollToError(), 50);
        });
      }
    });
  }
}