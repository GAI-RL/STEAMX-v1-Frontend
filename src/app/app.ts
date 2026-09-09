import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar';
import { FooterComponent } from './shared/components/footer/footer';
import { filter } from 'rxjs/operators';
import { SessionService } from './core/services/session-service';
import { Subscription } from 'rxjs';
import { SessionExpiredModal } from "./shared/session-expired-modal/session-expired-modal";
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, SessionExpiredModal],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit, OnDestroy {
  sessionExpired = false;
  private sub: Subscription | undefined;
  
  title = 'STEAMX';
  showHeaderFooter = true;

  constructor(
    private router: Router, 
    private sessionService: SessionService,
    private authService: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.updateHeaderFooterVisibility(window.location.pathname);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateHeaderFooterVisibility(event.url);
    });
  }

  private updateHeaderFooterVisibility(url: string): void {
    // Hide navbar/footer on chat, tcf, dashboard, login, register, and contact pages
    const isAppPage = url.includes('/chat') || 
                      url.includes('/tcf') || 
                      url.includes('/dashboard') || 
                      url.includes('/login') || 
                      url.includes('/register') || 
                      url.includes('/contact');
    this.showHeaderFooter = !isAppPage && !url.includes('#pricing');
  }

  ngOnInit(): void {
    this.updateHeaderFooterVisibility(window.location.pathname || this.router.url);
    this.sub = this.sessionService.sessionExpired$.subscribe(() => {
      console.log('session expired received');
      this.ngZone.run(() => {
        console.log('inside zone, setting true');
        this.sessionExpired = true;
        this.cdr.detectChanges();
      });
    });
  }

  handleAuthError(): void {
    this.sessionExpired = false;
    this.cdr.detectChanges();
    this.authService.logout();
    this.router.navigateByUrl('/login').then(success => {
      console.log('navigate result:', success);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}