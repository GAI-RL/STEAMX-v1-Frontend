import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export interface ChatSession {
  id: string;
  title: string;
  subject_id: string;
  grade_id: string;
  total_qa_pairs: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  prompt: string;
  response: string;
  response_version: number;
  created_at: string;
  updated_at: string;
  figures?: any[];
}

export interface SendMessageResponse {
  message_id: string;
  session_id: string;
  prompt: string;
  response: string;
  response_version: number;
  created_at: string;
  figures: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = `${environment.apiUrl}/chat`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllSessions(): Observable<ChatSession[]> {
    return this.http.get<ChatSession[]>(`${this.apiUrl}/sessions`, {
      headers: this.getAuthHeaders()
    });
  }

  getSession(sessionId: string): Observable<{ session: ChatSession; messages: ChatMessage[] }> {
    return this.http.get<{ session: ChatSession; messages: ChatMessage[] }>(`${this.apiUrl}/sessions/${sessionId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Updated: Create session with subject_id and grade_id
  createNewSession(subjectId: string, gradeId: string): Observable<ChatSession> {
    return this.http.post<ChatSession>(
      `${this.apiUrl}/sessions`,
      { subject_id: subjectId, grade_id: gradeId },
      { headers: this.getAuthHeaders() }
    );
  }

  // Updated: Send message with 'prompt' instead of 'question'
  sendMessage(sessionId: string, prompt: string): Observable<SendMessageResponse> {
    return this.http.post<SendMessageResponse>(
      `${this.apiUrl}/message`,
      { session_id: sessionId, prompt: prompt },
      { headers: this.getAuthHeaders() }
    );
  }

  deleteSession(sessionId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/sessions/${sessionId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // New: Regenerate response for a message
  regenerateResponse(messageId: string): Observable<{ message_id: string; response: string; response_version: number }> {
    return this.http.post<{ message_id: string; response: string; response_version: number }>(
      `${this.apiUrl}/message/regenerate`,
      { message_id: messageId },
      { headers: this.getAuthHeaders() }
    );
  }
}