import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CustomDropdownComponent } from '../../../shared/components/custom-dropdown/custom-dropdown.component';
import { FeedbackService } from '../../../core/services/feedback.service';
import { ContactFormPayload } from '../../../core/models/feedback.model';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CustomDropdownComponent],
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
  
  // Dropdown options for topic
  topicOptions = [
    'General Inquiry',
    'AI Exam System',
    'Collaboration',
    'Technical Support',
    'Pricing & Plans'
  ];
  
  contactLoading = false;
  contactSuccess = false;
  contactError = '';

  constructor(
    private router: Router,
    private feedbackService: FeedbackService
  ) {}

  // Navigate back to home
  goToHome() {
    this.router.navigate(['/']);
  }

  // Scroll to specific section on home page
  scrollToSection(sectionId: string) {
    this.router.navigate(['/']).then(() => {
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    });
  }

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

    const payload: ContactFormPayload = {
      first_name: this.contact.firstName,
      last_name: this.contact.lastName,
      email: this.contact.email,
      phone_number: this.contact.phone || undefined,
      topic: this.contact.topic,
      institution: this.contact.school || undefined,
      subject_line: this.contact.subject || undefined,
      message: this.contact.message
    };

    this.feedbackService.submitContactForm(payload).subscribe({
      next: (response) => {
        this.contactLoading = false;
        this.contactSuccess = true;
        
        // Reset form
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
      },
      error: (err) => {
        console.error('Error submitting contact form:', err);
        this.contactLoading = false;
        this.contactError = 'Failed to send message. Please try again later.';
      }
    });
  }
}