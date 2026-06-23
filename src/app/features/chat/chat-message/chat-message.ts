import { Component, Input, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ChatMessage } from '../../../core/services/chat.service';

// Display interface for the component
interface DisplayMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  figures?: any[];
}

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-message.html',
  styleUrl: './chat-message.css',
  encapsulation: ViewEncapsulation.None
})
export class ChatMessageComponent implements OnInit {
  @Input() message!: ChatMessage | DisplayMessage;
  @Input() userName: string = 'You';
  @Input() userInitial: string = 'U';
  @Input() showActions: boolean = true;

  @Output() editMessage = new EventEmitter<void>();
  @Output() retryMessage = new EventEmitter<void>();
  @Output() copyMessage = new EventEmitter<void>();

  displayRole: 'user' | 'assistant' = 'assistant';
  displayContent: SafeHtml = '';
  displayTimestamp: string = '';
  displayFigures: any[] = [];

  constructor(private sanitizer: DomSanitizer) {
    // Configure marked to use GFM and break on newlines
    marked.setOptions({
      gfm: true,
      breaks: true
    });
  }

  ngOnInit(): void {
    if ('role' in this.message) {
      const msg = this.message as DisplayMessage;
      this.displayRole = msg.role;
      this.displayTimestamp = msg.timestamp;
      this.displayFigures = msg.figures || [];
      this.displayContent = this.formatContent(msg.content);
    } else {
      const msg = this.message as ChatMessage;
      this.displayRole = 'assistant';
      this.displayTimestamp = msg.created_at;
      this.displayFigures = msg.figures || [];
      this.displayContent = this.formatContent(msg.response || '');
    }
  }

  formatTime(timestamp: string): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }

  formatContent(content: string): SafeHtml {
    if (!content) return '';
    
    // Remove hidden OCR text block BEFORE parsing markdown
    let cleanContent = content.replace(/\[OCR_TEXT\][\s\S]*?\[\/OCR_TEXT\]/g, '');
    
    // Parse Markdown to HTML
    let rawHtml = marked.parse(cleanContent) as string;
    
    // Wrap tables in a responsive container for scrolling
    rawHtml = rawHtml.replace(/<table>/g, '<div class="table-container"><table class="markdown-table">');
    rawHtml = rawHtml.replace(/<\/table>/g, '</table></div>');
    
    // Sanitize the HTML
    const sanitizedHtml = DOMPurify.sanitize(rawHtml);
    
    // Bypass Angular security to render the safe HTML
    return this.sanitizer.bypassSecurityTrustHtml(sanitizedHtml);
  }
}