import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Feedback, FeedbackResponse, ContactFormPayload } from '../models/feedback.model';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Submit feedback
  submitFeedback(feedback: Feedback): Observable<FeedbackResponse> {
    return this.http.post<FeedbackResponse>(`${this.apiUrl}/feedback`, feedback);
  }

  // Submit contact form
  submitContactForm(contactData: ContactFormPayload): Observable<FeedbackResponse> {
    return this.http.post<FeedbackResponse>(`${this.apiUrl}/feedback/contact`, contactData);
  }
}