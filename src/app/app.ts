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
export class  AppComponent implements OnInit, OnDestroy {
  sessionExpired = false;
  private sub: Subscription | undefined;
  

  title = 'STEAMX';
  showHeaderFooter = true;

  constructor(
    private router: Router, private sessionService: SessionService,
    private authService:AuthService,
    private ngZone: NgZone,
  private cdr: ChangeDetectorRef  )
   {
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Hide navbar/footer only on chat and dashboard pages
      this.showHeaderFooter = !event.url.includes('/chat') && 
                             !event.url.includes('/dashboard') && !event.url.includes('/login') && 
                             !event.url.includes('/register') &&
                       !event.url.includes('#pricing');
    });
  }
ngOnInit(): void {
   
    this.sub = this.sessionService.sessionExpired$.subscribe(() => {
  console.log('session expired received');   // ← check this fires
  this.ngZone.run(() => {
    console.log('inside zone, setting true'); // ← check this fires
    this.sessionExpired = true;
      this.cdr.detectChanges();  
  });
});
  }

handleAuthError(): void {
  this.sessionExpired = false;
  this.cdr.detectChanges();
  this.authService.logout();             // ← clears token first
  this.router.navigateByUrl('/login').then(success => {
    console.log('navigate result:', success);  // should now be true
  });
}

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
  //Testing




}


