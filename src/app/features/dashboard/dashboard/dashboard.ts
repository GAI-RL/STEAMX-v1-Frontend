import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { ChatSession, ChatMessage } from '../../../core/models/chat.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  
  user: User | null = null;
  currentDate = new Date();
  
  stats = {
    totalSessions: 0,
    messagesThisWeek: 0,
    learningStreak: 7,
    memberSince: '',
    plan: 'FREE'
  };
  
  recentSessions: ChatSession[] = [];
  loading = true;
  activityFilter: 'today' | 'week' | 'month' = 'week';
  sidebarCollapsed = false;
  userInitial = 'A';

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    if (this.user && this.user.full_name) {
      this.userInitial = this.user.full_name.charAt(0).toUpperCase();
    } else {
      this.userInitial = 'A';
    }
    
    this.loadDashboardData();
    
    setTimeout(() => {
      this.initScrollAnimations();
    }, 100);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  loadDashboardData(): void {
    if (this.user) {
      const memberDate = new Date(this.user.created_at);
      this.stats.memberSince = memberDate.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      
      this.stats.plan = (this.user.subscription_tier || 'free').toUpperCase();
    }

    this.chatService.getAllSessions().subscribe({
      next: (sessions) => {
        this.stats.totalSessions = sessions.length;
        this.recentSessions = sessions
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 6);
        
        // Count messages
        let messageCount = 0;
        sessions.forEach((session: ChatSession) => {
          if (session.messages && Array.isArray(session.messages)) {
            messageCount += session.messages.length;
          }
        });
        this.stats.messagesThisWeek = messageCount;
        
        this.stats.learningStreak = this.calculateLearningStreak(sessions);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
        this.loading = false;
      }
    });
  }

  calculateLearningStreak(sessions: ChatSession[]): number {
    if (sessions.length === 0) return 0;
    
    const today = new Date();
    const recentDays = sessions.filter((session: ChatSession) => {
      const sessionDate = new Date(session.created_at);
      const diffDays = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    });
    
    return Math.min(recentDays.length, 30);
  }

  refreshData(): void {
    this.loading = true;
    this.loadDashboardData();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getSessionPreview(session: ChatSession): string {
    if (!session) return 'No session data';
    
    if (!session.messages || !Array.isArray(session.messages) || session.messages.length === 0) {
      return 'No messages yet';
    }
    
    const firstUserMessage = session.messages.find((m: ChatMessage) => m && m.role === 'user');
    
    if (!firstUserMessage || !firstUserMessage.content) {
      return 'New conversation';
    }
    
    const preview = firstUserMessage.content.substring(0, 100);
    return preview.length < firstUserMessage.content.length ? preview + '...' : preview;
  }

  getUserFirstName(): string {
    if (!this.user?.full_name) return 'User';
    return this.user.full_name.split(' ')[0];
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }

  initScrollAnimations(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
  }
}