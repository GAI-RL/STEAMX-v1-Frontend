import { Component } from '@angular/core';
import {  EventEmitter, OnInit, OnDestroy, Output, ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-session-expired-modal',
  imports: [],
  templateUrl: './session-expired-modal.html',
  styleUrl: './session-expired-modal.css',
})
export class SessionExpiredModal {
   @Output() loginNow = new EventEmitter<void>();

  countdown = 5;
  private countdownInterval: any;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      this.cdr.detectChanges();
      if (this.countdown <= 0) {
        this.clearCountdown();
        this.loginNow.emit();
      }
    }, 1000);
  }

  onLoginNow(): void {
    this.clearCountdown();
    this.loginNow.emit();
  }

  private clearCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  ngOnDestroy(): void {
    this.clearCountdown();
  }

}
