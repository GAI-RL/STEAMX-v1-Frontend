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

  // Updated: Send message with optional file_ids
  sendMessage(sessionId: string, prompt: string, fileIds?: string[]): Observable<SendMessageResponse> {
    const payload: any = { session_id: sessionId, prompt: prompt };
    if (fileIds && fileIds.length > 0) {
      payload.file_ids = fileIds;
    }
    return this.http.post<SendMessageResponse>(
      `${this.apiUrl}/message`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  // New: Upload file to backend
  uploadFile(file: File): Observable<{ file_id: string; filename: string; size_bytes: number; mime_type: string }> {
    const formData = new FormData();
    formData.append('file', file);

    // Get auth token for multipart request
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Note: Do not set Content-Type header for FormData, browser sets it automatically with boundary
    return this.http.post<{ file_id: string; filename: string; size_bytes: number; mime_type: string }>(
      `${environment.apiUrl}/files/upload`,
      formData,
      { headers }
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