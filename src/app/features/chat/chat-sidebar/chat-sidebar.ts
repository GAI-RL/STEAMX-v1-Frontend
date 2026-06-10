import { Component, Input, Output, EventEmitter, OnChanges, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ChatSession } from '../../../core/services/chat.service';
import { SubjectService, Grade } from '../../../core/services/subject.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chat-sidebar.html',
  styleUrl: './chat-sidebar.css'
})
export class ChatSidebarComponent implements OnChanges, OnInit {
  @Input() sessions: ChatSession[] = [];
  @Input() activeSessionId: string | null = null;
  @Input() loading = false;
  @Input() collapsed = true;
  @Input() userName = 'User';
  @Input() userInitial = 'U';
  @Input() userPlan = 'FREE';
  @Input() selectedGrade: Grade | null = null;

  @Output() newChat = new EventEmitter<void>();
  @Output() selectSession = new EventEmitter<string>();
  @Output() deleteSession = new EventEmitter<string>();
  @Output() logout = new EventEmitter<void>();
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() gradeSelected = new EventEmitter<Grade>();

  // Available grades from API
  availableGrades: Grade[] = [];

  searchOpen = false;
  searchQuery = '';
  filteredSessions: ChatSession[] = [];
  userMenuOpen = false;

  // Delete chat modal state
  deleteModal = {
    show: false,
    sessionId: '',
    title: ''
  };

  // Delete account modal state
  deleteAccountModal = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private subjectService: SubjectService
  ) {}

  ngOnInit(): void {
    this.loadGrades();
  }

  loadGrades(): void {
    this.subjectService.getGrades().subscribe({
      next: (grades) => {
        this.availableGrades = grades && grades.length > 0 ? grades : [
          { id: '9', level: 9, display_name: 'Class 9' },
          { id: '10', level: 10, display_name: 'Class 10' },
          { id: '11', level: 11, display_name: 'Class 11' },
          { id: '12', level: 12, display_name: 'Class 12' }
        ];
      },
      error: (err) => {
        console.error('Error loading grades:', err);
        // Fallback to hardcoded grades if API fails
        this.availableGrades = [
          { id: '9', level: 9, display_name: 'Class 9' },
          { id: '10', level: 10, display_name: 'Class 10' },
          { id: '11', level: 11, display_name: 'Class 11' },
          { id: '12', level: 12, display_name: 'Class 12' }
        ];
      }
    });
  }

  onGradeSelected(grade: Grade): void {
    this.gradeSelected.emit(grade);
  }

  get displayedSessions(): ChatSession[] {
    return this.searchQuery.trim() ? this.filteredSessions : this.sessions;
  }

  get todaySessions(): ChatSession[] {
    try {
      const today = new Date().toDateString();
      return this.displayedSessions.filter(s => {
        const dStr = s.updated_at || s.created_at;
        if (!dStr) return false;
        return new Date(dStr).toDateString() === today;
      });
    } catch (e) {
      return [];
    }
  }

  get yesterdaySessions(): ChatSession[] {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      return this.displayedSessions.filter(s => {
        const dStr = s.updated_at || s.created_at;
        if (!dStr) return false;
        return new Date(dStr).toDateString() === yesterdayStr;
      });
    } catch (e) {
      return [];
    }
  }

  get olderSessions(): ChatSession[] {
    try {
      const today = new Date().toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      return this.displayedSessions.filter(s => {
        const dStr = s.updated_at || s.created_at;
        if (!dStr) return false;
        const sDateStr = new Date(dStr).toDateString();
        return sDateStr !== today && sDateStr !== yesterdayStr;
      });
    } catch (e) {
      return this.displayedSessions;
    }
  }

  ngOnChanges(): void {
    this.filterSessions();
  }

  toggleSearch(): void {
    this.searchOpen = !this.searchOpen;
    if (!this.searchOpen) this.clearSearch();
  }

  filterSessions(): void {
    if (!this.searchQuery.trim()) { 
      this.filteredSessions = []; 
      return; 
    }
    const q = this.searchQuery.toLowerCase();
    this.filteredSessions = this.sessions.filter(s =>
      (s.title || 'New Conversation').toLowerCase().includes(q)
    );
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredSessions = [];
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  handleLogout(): void {
    this.userMenuOpen = false;
    this.logout.emit();
  }

  promptDeleteSession(sessionId: string, title: string = ''): void {
    this.deleteModal = { show: true, sessionId, title };
  }

  confirmDeleteChat(): void {
    this.deleteSession.emit(this.deleteModal.sessionId);
    this.deleteModal = { show: false, sessionId: '', title: '' };
  }

  promptDeleteAccount(): void {
    this.userMenuOpen = false;
    this.deleteAccountModal = true;
  }

  confirmDeleteAccount(): void {
    this.deleteAccountModal = false;
    this.authService.logout();
    this.router.navigate(['/']);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.userMenuOpen = false;
    this.deleteModal.show = false;
    this.deleteAccountModal = false;
  }
}