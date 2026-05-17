import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessage } from '../../../core/models/chat.model';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-message.html',
  styleUrl: './chat-message.css'
})
export class ChatMessageComponent {
  @Input() message!: ChatMessage;
  @Input() userName: string = 'You';
  @Input() userInitial: string = 'U';
  @Input() showActions: boolean = false;
  @Output() editMessage = new EventEmitter<void>();
  @Output() retryMessage = new EventEmitter<void>();
  @Output() copyMessage = new EventEmitter<void>();
  copied = false;
  private copyResetTimer: ReturnType<typeof setTimeout> | null = null;

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }

  formatContent(content: string): string {
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