import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ChatService, ChatSession } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { SubjectService, Subject } from '../../../core/services/subject.service';
import { User } from '../../../core/models/user.model';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CalendarComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  
  user: User | null = null;
  currentDate = new Date();
  selectedDate: Date = new Date();
  Math = Math;
  
  // Main stats
  stats = {
    totalSessions: 0,
    questionsAsked: 0,
    learningStreak: 0,
    memberSince: '',
    plan: 'FREE',
    totalSessionsForDate: 0
  };
  
  // Subject-wise stats
  subjectStats: { subject: Subject; sessions: number; questions: number }[] = [];
  allSessions: ChatSession[] = [];
  allSubjects: Subject[] = [];
  
  // Calendar data
  sessionsByDate: Map<string, { sessions: number; questions: number }> = new Map();
  calendarStartDate: Date = new Date();
  
  // UI State
  recentSessions: ChatSession[] = [];
  loading = true;
  activityFilter: 'today' | 'week' | 'month' = 'week';
  sidebarCollapsed = false;
  userInitial = 'A';
  showSubjectStats = false;
  
  // Sparkline SVG Paths
  sessionsSparkline = { linePath: '', fillPath: '' };
  questionsSparkline = { linePath: '', fillPath: '' };
  streakSparkline = { linePath: '', fillPath: '' };

  constructor(
    private chatService: ChatService,
    private dashboardService: DashboardService,
    private subjectService: SubjectService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    if (this.user && this.user.full_name) {
      this.userInitial = this.user.full_name.charAt(0).toUpperCase();
      // Set calendar start date to user's first login
      if (this.user.first_login_at) {
        this.calendarStartDate = new Date(this.user.first_login_at);
      }
    } else {
      this.userInitial = 'A';
    }
    
    this.loadSubjects();
    this.loadDashboardData();
    
    setTimeout(() => {
      this.initScrollAnimations();
    }, 100);
  }

  loadSubjects(): void {
    this.subjectService.getSubjects().subscribe({
      next: (subjects) => {
        this.allSubjects = subjects.filter(s => s.is_active);
        this.calculateSubjectStats();
      },
      error: (err) => console.error('Error loading subjects:', err)
    });
  }

  calculateSubjectStats(): void {
    const subjectMap = new Map<string, { sessions: number; questions: number }>();
    
    this.allSessions.forEach(session => {
      const existing = subjectMap.get(session.subject_id);
      if (existing) {
        existing.sessions += 1;
        existing.questions += session.total_qa_pairs;
      } else {
        subjectMap.set(session.subject_id, {
          sessions: 1,
          questions: session.total_qa_pairs
        });
      }
    });
    
    this.subjectStats = this.allSubjects.map(subject => ({
      subject: subject,
      sessions: subjectMap.get(subject.id)?.sessions || 0,
      questions: subjectMap.get(subject.id)?.questions || 0
    })).filter(s => s.sessions > 0 || s.questions > 0);
  }

  toggleSubjectStats(): void {
    this.showSubjectStats = !this.showSubjectStats;
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
        this.allSessions = sessions;
        this.stats.totalSessions = sessions.length;
        this.recentSessions = sessions
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 6);
        
        this.stats.learningStreak = this.calculateLearningStreak(sessions);
        this.calculateSubjectStats();
        this.loadSessionsByDateRange();
        this.loadStatsForDate(this.selectedDate);
        this.loadWeeklyActivity();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
        this.loadDefaultSparklines();
        this.loading = false;
      }
    });
  }

  loadSessionsByDateRange(): void {
    // Build a map of sessions grouped by date
    this.sessionsByDate.clear();
    
    this.allSessions.forEach(session => {
      const dateKey = new Date(session.created_at).toISOString().split('T')[0];
      const existing = this.sessionsByDate.get(dateKey);
      if (existing) {
        existing.sessions += 1;
        existing.questions += session.total_qa_pairs;
      } else {
        this.sessionsByDate.set(dateKey, {
          sessions: 1,
          questions: session.total_qa_pairs
        });
      }
    });
  }

  loadWeeklyActivity(): void {
    this.dashboardService.getWeeklyActivity().subscribe({
      next: (response) => {
        if (response && response.activity) {
          const dailySessions = response.activity.map(a => a.sessions);
          const dailyQuestions = response.activity.map(a => a.questions);
          const dailyStreak = response.activity.map(a => a.sessions + a.questions);
          
          this.sessionsSparkline = this.generateSparklinePaths(dailySessions);
          this.questionsSparkline = this.generateSparklinePaths(dailyQuestions);
          this.streakSparkline = this.generateSparklinePaths(dailyStreak);
        } else {
          this.loadDefaultSparklines();
        }
      },
      error: (err) => {
        console.error('Error loading weekly activity:', err);
        this.loadDefaultSparklines();
      }
    });
  }

  loadStatsForDate(date: Date): void {
    const dateStr = date.toISOString().split('T')[0];
    const cachedStats = this.sessionsByDate.get(dateStr);
    
    if (cachedStats) {
      this.stats.questionsAsked = cachedStats.questions;
      this.stats.totalSessionsForDate = cachedStats.sessions;
    } else {
      this.stats.totalSessionsForDate = 0;
      // Try API as fallback
      this.dashboardService.getStats(dateStr).subscribe({
        next: (stats) => {
          this.stats.questionsAsked = stats.questions;
          this.stats.totalSessionsForDate = stats.sessions;
        },
        error: (err) => {
          console.error('Error loading stats for date:', err);
          this.stats.questionsAsked = 0;
          this.stats.totalSessionsForDate = 0;
        }
      });
    }
  }

  onDateSelected(date: Date): void {
    this.selectedDate = date;
    this.loadStatsForDate(date);
  }

  calculateLearningStreak(sessions: ChatSession[]): number {
    if (sessions.length === 0) return 0;
    
    const sessionDates = new Set<string>();
    sessions.forEach((session: ChatSession) => {
      const date = new Date(session.created_at).toDateString();
      sessionDates.add(date);
    });
    
    const sortedDates = Array.from(sessionDates).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
    
    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    if (sortedDates.includes(today) || sortedDates.includes(yesterdayStr)) {
      streak = 1;
      let checkDate = new Date();
      if (!sortedDates.includes(today)) {
        checkDate = yesterday;
      }
      
      for (let i = 1; i < 30; i++) {
        const prevDate = new Date(checkDate);
        prevDate.setDate(prevDate.getDate() - i);
        const prevDateStr = prevDate.toDateString();
        
        if (sortedDates.includes(prevDateStr)) {
          streak++;
        } else {
          break;
        }
      }
    }
    
    return streak;
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
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getSessionPreview(session: ChatSession): string {
    if (!session) return 'No session data';
    return session.title || 'New Conversation';
  }

  getQuestionCount(session: ChatSession): number {
    return session.total_qa_pairs || 0;
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

  loadDefaultSparklines(): void {
    this.sessionsSparkline = this.generateSparklinePaths([1, 1, 2, 1, 3, 2, 2]);
    this.questionsSparkline = this.generateSparklinePaths([1, 1, 4, 2, 6, 4, 3]);
    this.streakSparkline = this.generateSparklinePaths([2, 2, 6, 3, 9, 6, 5]);
  }

  generateSparklinePaths(data: number[]): { linePath: string; fillPath: string } {
    const width = 120;
    const height = 40;
    const padding = 5;
    const pointsCount = data.length;
    
    if (pointsCount === 0) {
      return { linePath: '', fillPath: '' };
    }
    
    const maxVal = Math.max(...data, 1);
    const xStep = width / (pointsCount - 1);
    
    const points = data.map((val, i) => {
      const x = i * xStep;
      const y = (height - padding) - ((val / maxVal) * (height - 2 * padding));
      return { x, y };
    });
    
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const fillPath = `${linePath} L 120 40 L 0 40 Z`;
    
    return { linePath, fillPath };
  }
}