import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  sessions: number;
  questions: number;
}

export interface RecentActivityItem {
  session_id: string;
  title: string;
  subject_name: string | null;
  grade_level: number | null;
  last_message_preview: string;
  qa_pairs_count: number;
  updated_at: string;
}

export interface CalendarRange {
  first_login_at: string;
  today: string;
}

export interface DailyActivityItem {
  date: string;
  sessions: number;
  questions: number;
}

export interface WeeklyActivityResponse {
  activity: DailyActivityItem[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

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

  getStats(date: string): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/stats?date_param=${date}`, {
      headers: this.getAuthHeaders()
    });
  }

  getRecentActivity(limit: number = 5): Observable<{ activities: RecentActivityItem[] }> {
    return this.http.get<{ activities: RecentActivityItem[] }>(`${this.apiUrl}/dashboard/recent-activity?limit=${limit}`, {
      headers: this.getAuthHeaders()
    });
  }

  getCalendarRange(): Observable<CalendarRange> {
    return this.http.get<CalendarRange>(`${this.apiUrl}/dashboard/calendar-range`, {
      headers: this.getAuthHeaders()
    });
  }

  getWeeklyActivity(): Observable<WeeklyActivityResponse> {
    return this.http.get<WeeklyActivityResponse>(`${this.apiUrl}/dashboard/weekly-activity`, {
      headers: this.getAuthHeaders()
    });
  }
}