import { Component, Input, OnInit } from '@angular/core';
import {  EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  styleUrl: './chat-message.css'
})
export class ChatMessageComponent implements OnInit {
  @Input() message!: ChatMessage | DisplayMessage;
  @Input() userName: string = 'You';
  @Input() userInitial: string = 'U';
  @Input() showActions: boolean = false;
  @Output() editMessage = new EventEmitter<void>();
  @Output() retryMessage = new EventEmitter<void>();
  @Output() copyMessage = new EventEmitter<void>();
  copied = false;
  private copyResetTimer: ReturnType<typeof setTimeout> | null = null;

  displayRole: 'user' | 'assistant' = 'assistant';
  displayContent: string = '';
  displayTimestamp: string = '';
  displayFigures: any[] = [];

  ngOnInit(): void {
    // Check if this is a DisplayMessage (has 'role' property)
    if ('role' in this.message) {
      const msg = this.message as DisplayMessage;
      this.displayRole = msg.role;
      this.displayContent = msg.content;
      this.displayTimestamp = msg.timestamp;
      this.displayFigures = msg.figures || [];
    } else {
      // Raw ChatMessage from backend - but this shouldn't happen directly
      // because chat-interface converts before passing
      const msg = this.message as ChatMessage;
      this.displayRole = 'assistant';
      this.displayContent = msg.response || '';
      this.displayTimestamp = msg.created_at;
      this.displayFigures = msg.figures || [];
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

  formatContent(content: string): string {
    if (!content) return '';
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  onEdit(): void { this.editMessage.emit(); }
  onRetry(): void { this.retryMessage.emit(); }
  onCopy(): void {
    this.copyMessage.emit();
    this.copied = true;
    if (this.copyResetTimer) {
      clearTimeout(this.copyResetTimer);
    }
    this.copyResetTimer = setTimeout(() => {
      this.copied = false;
    }, 1500);
  }
}