import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_active: boolean;
}

export interface Grade {
  id: string;
  level: number;
  display_name: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.apiUrl}/subjects/`);
  }

  getGrades(): Observable<Grade[]> {
    return this.http.get<Grade[]>(`${this.apiUrl}/subjects/grades`);
  }
}