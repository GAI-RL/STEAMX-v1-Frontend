import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ChatService, ChatSession, ChatMessage, SendMessageResponse } from '../../../core/services/chat.service';
import { SubjectService, Subject, Grade } from '../../../core/services/subject.service';
import { AuthService } from '../../../core/services/auth.service';
import { ChatSidebarComponent } from '../chat-sidebar/chat-sidebar';
import { ChatMessageComponent } from '../chat-message/chat-message';
import { User } from '../../../core/models/user.model';
import { SessionService } from '../../../core/services/session-service';

// Define a display message type that combines prompt and response for UI
interface DisplayMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  figures?: any[];
}

@Component({
  selector: 'app-chat-interface',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ChatSidebarComponent, ChatMessageComponent],
  templateUrl: './chat-interface.html',
  styleUrl: './chat-interface.css'
})
export class ChatInterfaceComponent implements OnInit, AfterViewChecked {

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  user: User | null = null;
  sessions: ChatSession[] = [];
  currentSession: ChatSession | null = null;
  currentSessionId: string | null = null;
  messages: DisplayMessage[] = [];
  currentMessage = '';
  loading = false;
  loadingSessions = false;
  sidebarCollapsed = true;
  inputFocused = false;
  inputMenuOpen = false;

  stats = { plan: 'FREE' };
  sendError: { type: 'offline' | 'timeout' | 'server' | 'unknown'; message: string } | null = null;
  sessionError: 'auth' | 'network' | 'service' | null = null;
  private shouldScroll = false;
  private isFirstMessage = false;
  sendErrorMessage: string = '';

  // Grade/Subject Selection State
  selectedGrade: Grade | null = null;
  selectedSubject: Subject | null = null;
  availableSubjects: Subject[] = [];
  availableGrades: Grade[] = [];

  constructor(
    private chatService: ChatService,
    private subjectService: SubjectService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private sessionService: SessionService,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    if (this.user) {
      this.stats.plan = (this.user.subscription_tier || 'free').toUpperCase();
    }

    // Load grades and subjects from API
    this.loadGradesAndSubjects();

    this.loadingSessions = true;
    this.chatService.getAllSessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        this.loadingSessions = false;

        const initialId = this.route.snapshot.params['id'];
        if (initialId && initialId !== this.currentSessionId) {
          this.loadSession(initialId);
        }
      },
      error: (err) => {
        console.error('Error loading sessions:', err);
        this.loadingSessions = false;
        if (err.status === 401 || err.status === 403) {
          this.sessionError = 'auth';
          this.cdr.detectChanges();
          this.sessionService.triggerSessionExpired();
        } else if (err.status === 521) {
          this.sessionError = 'service';
          this.cdr.detectChanges();
        } else {
          this.sessionError = 'network';
          this.cdr.detectChanges();
        }
      }
    });

    this.route.params.subscribe(params => {
      const sessionId = params['id'];
      if (sessionId && sessionId !== this.currentSessionId && !this.isFirstMessage) {
        this.loadSession(sessionId);
      }
    });
  }

  loadGradesAndSubjects(): void {
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
        this.availableGrades = [
          { id: '9', level: 9, display_name: 'Class 9' },
          { id: '10', level: 10, display_name: 'Class 10' },
          { id: '11', level: 11, display_name: 'Class 11' },
          { id: '12', level: 12, display_name: 'Class 12' }
        ];
      }
    });

    this.subjectService.getSubjects().subscribe({
      next: (subjects) => {
        const activeSubjects = subjects ? subjects.filter(s => s.is_active) : [];
        this.availableSubjects = activeSubjects.length > 0 ? activeSubjects : [
          { id: 'physics', name: 'Physics', icon: '⚛️', color: '#F59E0B', is_active: true },
          { id: 'chemistry', name: 'Chemistry', icon: '🧪', color: '#10B981', is_active: true },
          { id: 'mathematics', name: 'Mathematics', icon: '📐', color: '#8B5CF6', is_active: true },
          { id: 'biology', name: 'Biology', icon: '🧬', color: '#22C55E', is_active: true },
          { id: 'computer-science', name: 'Computer Science', icon: '💻', color: '#3B82F6', is_active: true },
          { id: 'python', name: 'Python Programming', icon: '🐍', color: '#06B6D4', is_active: true },
          { id: 'english', name: 'English', icon: '📝', color: '#EC4899', is_active: true },
          { id: 'urdu', name: 'Urdu', icon: '✍️', color: '#14B8A6', is_active: true },
          { id: 'pakistan-studies', name: 'Pakistan Studies', icon: '🇵🇰', color: '#F97316', is_active: true },
          { id: 'islamic-studies', name: 'Islamic Studies', icon: '🕌', color: '#A855F7', is_active: true }
        ];
      },
      error: (err) => {
        console.error('Error loading subjects:', err);
        this.availableSubjects = [
          { id: 'physics', name: 'Physics', icon: '⚛️', color: '#F59E0B', is_active: true },
          { id: 'chemistry', name: 'Chemistry', icon: '🧪', color: '#10B981', is_active: true },
          { id: 'mathematics', name: 'Mathematics', icon: '📐', color: '#8B5CF6', is_active: true },
          { id: 'biology', name: 'Biology', icon: '🧬', color: '#22C55E', is_active: true },
          { id: 'computer-science', name: 'Computer Science', icon: '💻', color: '#3B82F6', is_active: true },
          { id: 'python', name: 'Python Programming', icon: '🐍', color: '#06B6D4', is_active: true },
          { id: 'english', name: 'English', icon: '📝', color: '#EC4899', is_active: true },
          { id: 'urdu', name: 'Urdu', icon: '✍️', color: '#14B8A6', is_active: true },
          { id: 'pakistan-studies', name: 'Pakistan Studies', icon: '🇵🇰', color: '#F97316', is_active: true },
          { id: 'islamic-studies', name: 'Islamic Studies', icon: '🕌', color: '#A855F7', is_active: true }
        ];
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) { 
      this.scrollToBottom(); 
      this.shouldScroll = false; 
    }
  }

  loadSession(sessionId: string): void {
    if (this.isFirstMessage && this.currentSessionId === sessionId) {
      return;
    }

    this.currentSessionId = sessionId;
    const hadMessages = this.messages.length > 0;
    if (!hadMessages) {
      this.loading = true;
    }

    this.chatService.getSession(sessionId).subscribe({
      next: (response) => {
        this.currentSession = response.session;
        
        // Convert Q&A pairs to display message format
        this.messages = [];
        (response.messages || []).forEach((qa: ChatMessage) => {
          // Add user message
          this.messages.push({
            id: `${qa.id}_user`,
            session_id: qa.session_id,
            role: 'user',
            content: qa.prompt,
            timestamp: qa.created_at,
            figures: []
          });
          // Add assistant message
          this.messages.push({
            id: qa.id,
            session_id: qa.session_id,
            role: 'assistant',
            content: qa.response,
            timestamp: qa.created_at,
            figures: qa.figures || []
          });
        });

        this.shouldScroll = true;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading session:', err);
        this.loading = false;
        this.cdr.detectChanges();
        if (err.status === 401 || err.status === 403) {
          this.sessionService.triggerSessionExpired();
        }
      }
    });
  }

  createNewSession(): void {
    this.currentSession = null;
    this.currentSessionId = null;
    this.messages = [];
    this.loading = false;
    this.isFirstMessage = false;
    this.cdr.detectChanges();
    setTimeout(() => { 
      if (this.messageInput) this.messageInput.nativeElement.focus(); 
    }, 100);
  }

  sendMessage(): void {
    if (!this.currentMessage.trim() || this.loading) return;
    
    // Check if subject and grade are selected
    if (!this.selectedGrade || !this.selectedSubject) {
      this.sendErrorMessage = 'Please select a grade and subject before starting a chat.';
      return;
    }
    
    const userPrompt = this.currentMessage.trim();
    this.currentMessage = '';

    if (this.messageInput) {
      this.messageInput.nativeElement.style.height = 'auto';
    }

    this.loading = true;
    this.sendError = null;

    if (!this.currentSessionId) {
      this.isFirstMessage = true;

      // Create session with selected subject and grade
      this.chatService.createNewSession(this.selectedSubject.id, this.selectedGrade.id).subscribe({
        next: (session) => {
          this.currentSessionId = session.id;
          this.currentSession = session;
          this.loadSessions(true);
          this.sendToSession(userPrompt, session.id);
        },
        error: (err) => {
          console.error('Error creating session:', err);
          this.loading = false;
          this.isFirstMessage = false;
          if (err.status === 401 || err.status === 403) {
            this.sessionService.triggerSessionExpired();
          } else {
            this.sendErrorMessage = 'Failed to create chat session. Please try again.';
          }
        }
      });
    } else {
      this.sendToSession(userPrompt, this.currentSessionId);
    }
  }

  private sendToSession(prompt: string, sessionId: string): void {
    this.sendErrorMessage = '';
    
    // Add user message to UI immediately
    const userMessage: DisplayMessage = {
      id: Date.now().toString(),
      session_id: sessionId,
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
      figures: []
    };
    this.messages.push(userMessage);
    this.shouldScroll = true;
    this.cdr.detectChanges();

    this.chatService.sendMessage(sessionId, prompt).subscribe({
      next: (response: SendMessageResponse) => {
        // Add assistant message to UI
        const assistantMessage: DisplayMessage = {
          id: response.message_id,
          session_id: response.session_id,
          role: 'assistant',
          content: response.response,
          timestamp: response.created_at,
          figures: response.figures || []
        };
        
        this.messages.push(assistantMessage);
        this.shouldScroll = true;
        this.loading = false;

        if (this.isFirstMessage) {
          this.isFirstMessage = false;
          window.history.replaceState({}, '', `/chat/${sessionId}`);
        }

        this.cdr.detectChanges();
        this.loadSessions(true);

        if (this.currentSession && this.currentSession.title === 'New Conversation') {
          this.currentSession = {
            ...this.currentSession,
            title: prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt
          };
        }
      },
      error: (err) => {
        console.error('Send message error:', err);
        this.messages.pop(); // Remove the user message on error
        this.loading = false;
        this.isFirstMessage = false;
        
        if (err.status === 401 || err.status === 403) {
          this.sessionService.triggerSessionExpired();
        } else if (err.status === 404) {
          this.sendErrorMessage = 'AI service is temporarily unavailable. Please try again in a few moments';
        } else if (err.status === 429) {
          this.sendErrorMessage = 'You have reached your usage limit. Please try again later or upgrade your plan.';
        } else if (err.status === 0) {
          this.sendErrorMessage = 'No internet connection. Please check your network.';
        } else if (err.status === 521) {
          this.sendErrorMessage = 'Web Server is currently down. Please try again later.';
        } else {
          this.sendErrorMessage = 'Something went wrong. Please try again.';
        }
        this.shouldScroll = true;
        this.cdr.detectChanges();
      }
    });
  }

  handleGradeSelected(grade: Grade): void {
    this.selectedGrade = grade;
    this.selectedSubject = null;
  }

  selectSubject(subject: Subject): void {
    this.selectedSubject = this.selectedSubject?.id === subject.id ? null : subject;
  }

  getSubjectClass(subjectName: string): string {
    const s = subjectName.toLowerCase();
    if (s.includes('biology')) return 'sub-biology';
    if (s.includes('chemistry')) return 'sub-chemistry';
    if (s.includes('physics')) return 'sub-physics';
    if (s.includes('mathematics') || s.includes('math')) return 'sub-math';
    if (s.includes('computer') || s.includes('cs') || s.includes('python')) return 'sub-cs';
    if (s.includes('english')) return 'sub-english';
    return 'sub-default';
  }

  getPlaceholderText(): string {
    if (!this.selectedGrade) {
      return 'Please select your class in the sidebar...';
    }
    if (!this.selectedSubject) {
      return 'Please select a subject above to start tutoring...';
    }
    return 'Ask anything...';
  }

  dismissError(): void {
    this.sendError = null;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.inputMenuOpen = false; }

  toggleInputMenu(): void { this.inputMenuOpen = !this.inputMenuOpen; }

  handleInputAction(action: string): void {
    this.inputMenuOpen = false;
    if (action === 'upload') {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = 'image/*,.pdf,.doc,.docx,.txt,.csv';
      input.click();
    }
  }

  loadSessions(silent = false): void {
    if (!silent) this.loadingSessions = true;
    this.chatService.getAllSessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        if (!silent) this.loadingSessions = false;
      },
      error: (err) => {
        console.error('Error loading sessions:', err);
        if (!silent) this.loadingSessions = false;
        if (err.status === 401 || err.status === 403) {
          this.sessionService.triggerSessionExpired();
        } else if (err.status === 521 || err.status === 0) {
          this.sessionError = 'service';
          this.cdr.detectChanges();
        } else {
          this.sessionError = 'network';
          this.cdr.detectChanges();
        }
      }
    });
  }

  handleDeleteSession(sessionId: string): void {
    this.chatService.deleteSession(sessionId).subscribe({
      next: () => {
        this.sessions = this.sessions.filter(s => s.id !== sessionId);
        if (this.currentSessionId === sessionId) this.createNewSession();
      },
      error: (err) => {
        console.error('Error deleting session:', err);
        if (err.status === 401 || err.status === 403) {
          this.sessionService.triggerSessionExpired();
        }
      }
    });
  }

  clearCurrentChat(): void {
    if (!this.currentSessionId) { this.messages = []; return; }
    this.handleDeleteSession(this.currentSessionId);
  }

  toggleSidebar(): void { this.sidebarCollapsed = !this.sidebarCollapsed; }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onTextareaInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  }

  usePrompt(prompt: string): void {
    this.currentMessage = prompt;
    setTimeout(() => {
      if (this.messageInput) {
        this.messageInput.nativeElement.focus();
        const textarea = this.messageInput.nativeElement;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
      }
    }, 0);
  }

  scrollToBottom(): void {
    try { 
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight; 
    } catch {}
  }

  getUserMessageCount(): number {
    return this.messages.filter(m => m.role === 'user').length;
  }

  getUserFirstName(): string {
    if (!this.user?.full_name) return 'there';
    return this.user.full_name.split(' ')[0];
  }

  getUserInitial(): string {
    if (!this.user?.full_name) return 'U';
    return this.user.full_name.charAt(0).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}