import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasData: boolean;
  sessionsCount: number;
  questionsCount: number;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit, OnChanges {
  @Input() startDate: Date = new Date(); // first_login_at
  @Input() selectedDate: Date = new Date();
  @Input() sessionsByDate: Map<string, { sessions: number; questions: number }> = new Map();
  
  @Output() dateSelected = new EventEmitter<Date>();
  
  today: Date = new Date();
  currentMonth: Date = new Date();
  calendarDays: CalendarDay[] = [];
  monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  // View mode: 'month' or 'year'
  viewMode: 'month' | 'year' = 'month';
  years: number[] = [];
  selectedYear: number = new Date().getFullYear();
  
  ngOnInit(): void {
    this.today.setHours(0, 0, 0, 0);
    this.generateYears();
    this.currentMonth = this.selectedDate;
    this.generateCalendar();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedDate'] && this.selectedDate) {
      this.currentMonth = this.selectedDate;
      this.generateCalendar();
    }
    if (changes['sessionsByDate']) {
      this.generateCalendar();
    }
  }
  
  generateYears(): void {
    const currentYear = new Date().getFullYear();
    const startYear = this.startDate.getFullYear();
    for (let year = startYear; year <= currentYear + 1; year++) {
      this.years.push(year);
    }
  }
  
  generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    // Get first day of month
    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay();
    
    // Get last day of month
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Get days from previous month to fill first row
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    this.calendarDays = [];
    const today = this.today;
    
    // Disable dates before startDate
    const startDateOnly = new Date(this.startDate);
    startDateOnly.setHours(0, 0, 0, 0);
    
    // Previous month days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNumber = prevMonthLastDay - i;
      const date = new Date(year, month - 1, dayNumber);
      const isDisabled = date < startDateOnly;
      this.calendarDays.push({
        date: date,
        dayNumber: dayNumber,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        hasData: false,
        sessionsCount: 0,
        questionsCount: 0
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = this.selectedDate && date.toDateString() === this.selectedDate.toDateString();
      const dateKey = date.toISOString().split('T')[0];
      const stats = this.sessionsByDate.get(dateKey) || { sessions: 0, questions: 0 };
      const hasData = stats.sessions > 0 || stats.questions > 0;
      
      this.calendarDays.push({
        date: date,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: isToday,
        isSelected: isSelected,
        hasData: hasData,
        sessionsCount: stats.sessions,
        questionsCount: stats.questions
      });
    }
    
    // Next month days (to complete grid)
    const remainingDays = 42 - this.calendarDays.length; // 6 rows * 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      this.calendarDays.push({
        date: date,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        hasData: false,
        sessionsCount: 0,
        questionsCount: 0
      });
    }
  }
  
  selectDate(day: CalendarDay): void {
    const startDateOnly = new Date(this.startDate);
    startDateOnly.setHours(0, 0, 0, 0);
    
    if (day.date >= startDateOnly && day.date <= new Date()) {
      this.dateSelected.emit(day.date);
    }
  }
  
  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.generateCalendar();
  }
  
  nextMonth(): void {
    const nextMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    const today = new Date();
    if (nextMonth <= today || nextMonth.getFullYear() < today.getFullYear()) {
      this.currentMonth = nextMonth;
      this.generateCalendar();
    }
  }
  
  goToToday(): void {
    this.currentMonth = new Date();
    this.generateCalendar();
    this.dateSelected.emit(new Date());
  }
  
  getMonthYearString(): string {
    return `${this.monthNames[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}`;
  }
}