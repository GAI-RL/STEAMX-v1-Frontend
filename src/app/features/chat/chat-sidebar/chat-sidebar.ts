import { Component, Input, Output, EventEmitter, OnChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ChatSession } from '../../../core/models/chat.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chat-sidebar.html',
  styleUrl: './chat-sidebar.css'
})
export class ChatSidebarComponent implements OnChanges {
  @Input() sessions: ChatSession[] = [];
  @Input() activeSessionId: string | null = null;
  @Input() loading = false;
  @Input() collapsed = true; // Changed to true - sidebar closed by default
  @Input() userName = 'User';
  @Input() userInitial = 'U';
  @Input() userPlan = 'FREE';

  @Output() newChat = new EventEmitter<void>();
  @Output() selectSession = new EventEmitter<string>();
  @Output() deleteSession = new EventEmitter<string>();
  @Output() logout = new EventEmitter<void>();
  @Output() toggleSidebar = new EventEmitter<void>();

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

  constructor(private authService: AuthService, private router: Router) {}

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
    if (!this.searchQuery.trim()) { this.filteredSessions = []; return; }
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

  // Handle logout - close menu and emit event
  handleLogout(): void {
    this.userMenuOpen = false;
    this.logout.emit();
  }

  // Show delete chat confirmation modal
  promptDeleteSession(sessionId: string, title: string = ''): void {
    this.deleteModal = { show: true, sessionId, title };
  }

  // User confirmed delete chat
  confirmDeleteChat(): void {
    this.deleteSession.emit(this.deleteModal.sessionId);
    this.deleteModal = { show: false, sessionId: '', title: '' };
  }

  // Show delete account confirmation modal
  promptDeleteAccount(): void {
    this.userMenuOpen = false;
    this.deleteAccountModal = true;
  }

  // User confirmed delete account
  confirmDeleteAccount(): void {
    this.deleteAccountModal = false;
    
    // Simple implementation: Just logout the user
    // In a production app, you would call an API endpoint to actually delete the account
    // For now, we'll just log them out
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