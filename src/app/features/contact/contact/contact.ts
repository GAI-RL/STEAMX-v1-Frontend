import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css']
})
export class ContactComponent {
  
  // Contact Form Data
  contact = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    topic: '',
    school: '',
    subject: '',
    message: ''
  };
  
  contactLoading = false;
  contactSuccess = false;
  contactError = '';

  submitContact() {
    this.contactError = '';

    if (!this.contact.firstName || !this.contact.lastName || !this.contact.email || !this.contact.topic || !this.contact.message) {
      this.contactError = 'Please fill in all required fields';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.contact.email)) {
      this.contactError = 'Please enter a valid email address';
      return;
    }

    this.contactLoading = true;
    this.contactSuccess = false;

    setTimeout(() => {
      this.contactLoading = false;
      this.contactSuccess = true;
      
      this.contact = { 
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        topic: '',
        school: '',
        subject: '',
        message: ''
      };
      
      setTimeout(() => {
        this.contactSuccess = false;
      }, 5000);
    }, 1500);
  }
}