import { Routes } from '@angular/router';
import { SteamxHomeComponent } from './features/landing/steamx-home/steamx-home';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard';
import { ChatInterfaceComponent } from './features/chat/chat-interface/chat-interface';
import { ContactComponent } from './features/contact/contact/contact';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';

export const routes: Routes = [
  // ════════════════════════════════════════════════════════════
  // PUBLIC ROUTES (No authentication required)
  // ════════════════════════════════════════════════════════════
  { 
    path: '', 
    component: SteamxHomeComponent 
  },
  { 
    path: 'contact', 
    component: ContactComponent 
  },
  
  // ════════════════════════════════════════════════════════════
  // GUEST ROUTES (Only accessible when NOT logged in)
  // Logged-in users will be redirected to dashboard
  // ════════════════════════════════════════════════════════════
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [guestGuard]
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [guestGuard]
  },
  
  // ════════════════════════════════════════════════════════════
  // PROTECTED ROUTES (Require authentication)
  // Non-logged-in users will be redirected to login
  // ════════════════════════════════════════════════════════════
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'chat', 
    component: ChatInterfaceComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'chat/:id', 
    component: ChatInterfaceComponent,
    canActivate: [authGuard]
  },
  
  // ════════════════════════════════════════════════════════════
  // FALLBACK ROUTE
  // ════════════════════════════════════════════════════════════
  { 
    path: '**', 
    redirectTo: '' 
  }
];