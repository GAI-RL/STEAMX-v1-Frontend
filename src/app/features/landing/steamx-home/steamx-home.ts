import { Component, OnInit, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-steamx-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './steamx-home.html',
  styleUrl: './steamx-home.css'
})
export class SteamxHomeComponent implements OnInit, OnDestroy, AfterViewInit {
  
  // ==================== FAQ ====================
  openFaqIndex: number | null = null;

  // ==================== FEATURES CAROUSEL ====================
  currentFeatureSet = 0;
  featureSetInterval: any;

  // Dashboard Animation Flag
  private dashboardAnimated = false;

  // Enhanced Features - Minimal Horizontal Scroll
  features = [
    {
      title: 'Instant Explanations',
      description: 'Get clear, detailed answers to any question in seconds. No waiting, just learning.',
      iconPath: 'M13 10V3L4 14h7v7l9-11h-7z'
    },
    {
      title: 'Step-by-Step Solutions',
      description: 'See problems broken down into manageable steps with reasoning for each one.',
      iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
    },
    {
      title: 'Works Across Subjects',
      description: 'From calculus to creative writing, get reliable help in any academic field.',
      iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
    },
    {
      title: 'Available 24/7',
      description: 'Study on your schedule. Get help at 3 AM or during your lunch break.',
      iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      title: 'Adapts to You',
      description: 'Explanations adjust to your level and learning style automatically.',
      iconPath: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
    },
    {
      title: 'Save & Export',
      description: 'Keep all your conversations. Export to PDF or search your history anytime.',
      iconPath: 'M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2'
    },
    {
      title: 'Contextual Understanding',
      description: 'Ask follow-up questions naturally. The AI remembers your conversation.',
      iconPath: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
    },
    {
      title: 'Multiple Languages',
      description: 'Learn in your preferred language with support for 50+ languages worldwide.',
      iconPath: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129'
    }
  ];

  currentSlide = 0;
  carouselTransform = '0px';
  autoPlayInterval: any;
  autoPlayDuration = 30;
  scrollSpeed = 1;

  // How It Works Steps Data
  steps = [
    {
      number: 1,
      title: 'Sign up in under 30 seconds',
      description: 'Create your free account using email or Google sign-in. No credit card required to start learning. Jump straight into your first conversation without lengthy setup or tutorials.',
      icon: '→',
      image: 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?w=300&q=80'
    },
    {
      number: 2,
      title: 'Ask questions naturally',
      description: 'Type your question as you\'d ask a real tutor—no special formatting needed. Upload homework problems, share equations, or describe concepts you\'re struggling with. Our system understands context and nuance.',
      icon: '→',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&q=80'
    },
    {
      number: 3,
      title: 'Learn and progress',
      description: 'Review your conversation history anytime. Track which topics you\'ve mastered and which need more attention. Build a personalized library of explanations tailored exactly to your learning needs.',
      icon: '→',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&q=80'
    }
  ];

  // Real Testimonials - Complete with full text
  testimonials = [
    {
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      name: 'Ahmed Hassan',
      role: 'Computer Science Major, MIT',
      text: 'I was failing data structures until I started using STEAMX. The way it breaks down recursion and dynamic programming finally made things click. Went from a C+ to an A- in one semester. The 24/7 availability saved me during late-night coding sessions. I can honestly say this platform changed my academic life forever.',
      rating: 5,
      platform: 'Verified Student',
      theme: 'teal'
    },
    {
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      name: 'Sarah Johnson',
      role: 'Part-Time MBA Student',
      text: 'Between work and classes, I don\'t have time to wait for tutoring appointments. STEAMX gives me instant help with financial modeling and statistics at 2 AM when I\'m actually free to study. My grades improved significantly once I could learn on my own schedule. I am so excited to be a part of this platform!',
      rating: 5,
      platform: 'Verified Professional',
      theme: 'orange'
    },
    {
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
      name: 'Dr. Michael Chen',
      role: 'PhD Candidate, Harvard Medical School',
      text: 'Research requires understanding concepts across multiple disciplines quickly. STEAMX helps me grasp biochemistry principles outside my specialty faster than reading papers alone. The ability to ask follow-up questions until I truly understand is invaluable. Highly recommended for any researcher.',
      rating: 5,
      platform: 'Verified Researcher',
      theme: 'green'
    },
    {
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
      name: 'Emily Rodriguez',
      role: 'High School AP Physics Teacher',
      text: 'I recommend STEAMX to students who need extra support outside class hours. It doesn\'t just hand them answers—it teaches problem-solving approaches. I\'ve noticed students asking better questions in class and showing deeper understanding on exams. I have been teaching for over 10 years and this is the best tool I\'ve found.',
      rating: 5,
      platform: 'Verified Educator',
      theme: 'purple'
    }
  ];

  currentTestimonial = 0;
  testimonialInterval: any;
  private autoPlayDelay = 5000;

  // Touch/Swipe support for mobile
  private touchStartX = 0;
  private touchEndX = 0;
  private minSwipeDistance = 50;

  // Team
  team = [
    {
      avatar: 'assets/images/Nauman.jpeg',
      name: 'Nauman Hanif',
      role: 'Founder',
      bio: 'Founded STEAMx to transform digital education in Pakistan,leading strategic vision and cross functional teams to build the AI-powered learning platform.',
      twitter: '#'
    },
    
    
    {
      avatar: 'assets/images/Tooba.png',
      name: 'Tooba Pervaiz',
      role: 'Technical Project Manager',
      bio: 'Led cross-functional execution to deliver milestones on time while aligning product strategy with engineering delivery.',
      linkedin: '#',
      twitter: '#'
    },
    
    {
      avatar: 'assets/images/Rameez.png',
      name: 'Rameez Qadeer',
      role: 'AI Engineer',
      bio: 'Built a high-performance Generative AI system, integrating intelligent data retrieval and LLM coordination to deliver accurate, context-aware outputs.',
      linkedin: '#',
      twitter: '#'
    },
    {
      avatar: 'assets/images/Aiemen.png',
      name: 'Aiemen Altaf',
      role: 'Full-Stack Engineer',
      bio: 'Built and integrated end-to-end application features, ensuring seamless functionality across frontend and backend systems.',
      linkedin: '#',
      twitter: '#'
    }
  ];

  // Pricing
  pricingPlans = [
    {
      name: 'Free',
      price: '0',
      period: 'forever',
      featured: false,
      description: 'Perfect for trying out STEAMX with no commitment',
      features: [
        '100 questions per month',
        'GPT-3.5 powered responses',
        'Community support forum',
        'Web browser access',
        '7 days of chat history'
      ],
      buttonText: 'Start Free',
      icon: ''
    },
    {
      name: 'Pro',
      price: '9.99',
      period: 'month',
      featured: true,
      description: 'Best for serious students who need unlimited help',
      features: [
        'Unlimited questions',
        'GPT-4 powered advanced responses',
        'Priority email support within 24 hours',
        'Mobile apps + web + browser extension',
        'Unlimited chat history with full search',
        'Upload images and PDFs for help',
        'Export conversations to PDF',
        'Ad-free experience'
      ],
      buttonText: 'Start 7-Day Free Trial',
      icon: '',
      savings: 'Save $24/year with annual billing'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      featured: false,
      description: 'For schools, universities, and organizations',
      features: [
        'Everything in Pro for all users',
        'Custom AI training on your curriculum',
        'Dedicated success manager',
        'Single sign-on (SSO) integration',
        'REST API access for integrations',
        'Admin dashboard with usage analytics',
        'FERPA and GDPR compliance tools',
        '99.9% uptime SLA',
        'Custom deployment options'
      ],
      buttonText: 'Contact Sales',
      icon: ''
    }
  ];

  // Statistics
  stats = {
    users: '50,000+',
    questions: '5M+',
    satisfaction: '98%',
    countries: '150+'
  };

  // Visitors Overview Live Data
  totalVisitors = 0;
  newVisitors = 0;
  returningVisitors = 0;
  newVisitorsPct = 0;
  returningVisitorsPct = 0;
  chartActive = false;

  // Scroll Animation Observers
  private intersectionObserver?: IntersectionObserver;
  private heroObserver?: IntersectionObserver;

  ngOnInit() {
    this.startAutoScroll();
    this.startTestimonialCarousel();
    this.startFeatureAutoRotation();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initScrollAnimations();
      this.initHeroAnimation();
      this.initDashboardAnimation();
      this.animateTrustNumbers();
      this.initStepObservers();
      this.initDashboardCounterAnimation();
    }, 100);
  }

  ngOnDestroy() {
    this.stopAutoScroll();
    
    if (this.testimonialInterval) {
      clearInterval(this.testimonialInterval);
    }
    
    if (this.featureSetInterval) {
      clearInterval(this.featureSetInterval);
    }
    
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    if (this.heroObserver) {
      this.heroObserver.disconnect();
    }
  }

  // ==================== FAQ ====================
  
  toggleFaq(index: number) {
    this.openFaqIndex = this.openFaqIndex === index ? null : index;
  }

  // ==================== FEATURES CAROUSEL ====================
  
  startFeatureAutoRotation() {
    this.featureSetInterval = setInterval(() => {
      this.currentFeatureSet = this.currentFeatureSet === 0 ? 1 : 0;
    }, 3000);
  }

  resetFeatureInterval() {
    if (this.featureSetInterval) {
      clearInterval(this.featureSetInterval);
      this.startFeatureAutoRotation();
    }
  }

  goToFeatureSet(index: number) {
    this.currentFeatureSet = index;
    this.resetFeatureInterval();
  }

  // ==================== DASHBOARD ANIMATION ====================
  
  initDashboardAnimation() {
    const dashboard = document.querySelector('.db');
    if (!dashboard) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.dashboardAnimated) {
          this.dashboardAnimated = true;
          this.animateDashboard();
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });

    observer.observe(dashboard);
  }

  animateDashboard() {
    const bars = document.querySelectorAll('.bar-fill');
    bars.forEach((bar: any) => {
      const width = bar.getAttribute('data-w');
      if (width) {
        setTimeout(() => {
          bar.style.width = width + '%';
        }, 100);
      }
    });

    const avgEl = document.getElementById('avg-score');
    const testsEl = document.getElementById('tests-taken');
    const qEl = document.getElementById('q-count');
    const qBar = document.getElementById('q-bar');

    if (avgEl && testsEl && qEl && qBar) {
      const duration = 1200;
      const startTime = performance.now();
      
      const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      
      const animate = (ts: number) => {
        const elapsed = ts - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = ease(progress);
        
        const avgScore = Math.round(eased * 86);
        avgEl.textContent = avgScore + '%';
        
        const testsTaken = Math.round(eased * 12);
        testsEl.textContent = testsTaken.toString();
        
        const questions = Math.round(eased * 432);
        qEl.textContent = questions.toLocaleString();
        
        const barPercent = Math.round((questions / 600) * 100);
        qBar.style.width = barPercent + '%';
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }

  initDashboardCounterAnimation() {
    const dashboard = document.querySelector('.db');
    if (!dashboard) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateLeaderboardScores();
          observer.disconnect();
        }
      });
    }, { threshold: 0.5 });

    observer.observe(dashboard);
  }

  animateLeaderboardScores() {
    const scoreElements = document.querySelectorAll('.lb-score');
    const targetScores = [94, 88, 82, 76];
    
    scoreElements.forEach((el, idx) => {
      if (idx < targetScores.length) {
        let current = 0;
        const target = targetScores[idx];
        const duration = 1000;
        const increment = target / (duration / 16);
        
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            el.textContent = target + '%';
            clearInterval(timer);
          } else {
            el.textContent = Math.floor(current) + '%';
          }
        }, 16);
      }
    });
  }

  initStepObservers() {
    const steps = document.querySelectorAll('.step-vertical');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('step-visible');
          }, idx * 150);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3, rootMargin: '0px 0px -50px 0px' });

    steps.forEach(step => observer.observe(step));
  }

  // ==================== CONTINUOUS HORIZONTAL SCROLL ====================
  
  startAutoScroll() {
    let position = 0;
    
    this.autoPlayInterval = setInterval(() => {
      position -= this.scrollSpeed;
      
      const cardWidth = 320;
      const gap = 24;
      const totalWidth = this.features.length * (cardWidth + gap);
      
      if (Math.abs(position) >= totalWidth) {
        position = 0;
      }
      
      this.carouselTransform = `${position}px`;
    }, this.autoPlayDuration);
  }

  stopAutoScroll() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  // ==================== TESTIMONIALS CAROUSEL ====================
  
  startTestimonialCarousel() {
    if (this.testimonialInterval) {
      clearInterval(this.testimonialInterval);
    }
    this.testimonialInterval = setInterval(() => {
      this.nextTestimonial();
    }, this.autoPlayDelay);
  }

  resetAutoPlay() {
    if (this.testimonialInterval) {
      clearInterval(this.testimonialInterval);
      this.startTestimonialCarousel();
    }
  }

  nextTestimonial() {
    if (this.currentTestimonial < this.testimonials.length - 1) {
      this.currentTestimonial++;
    } else {
      this.currentTestimonial = 0;
    }
  }

  previousTestimonial() {
    if (this.currentTestimonial > 0) {
      this.currentTestimonial--;
    } else {
      this.currentTestimonial = this.testimonials.length - 1;
    }
  }

  goToTestimonial(index: number) {
    this.currentTestimonial = index;
    this.resetAutoPlay();
  }

  public getPreviousIndex(): number {
    return this.currentTestimonial === 0 
      ? this.testimonials.length - 1 
      : this.currentTestimonial - 1;
  }

  public getNextIndex(): number {
    return this.currentTestimonial === this.testimonials.length - 1 
      ? 0 
      : this.currentTestimonial + 1;
  }

  public getTrackTransform(): string {
    const cardWidthPercent = 33.333;
    const offset = (this.currentTestimonial * cardWidthPercent);
    return `translateX(calc(-${offset}% + 50% - ${cardWidthPercent / 2}%))`;
  }

  public getTestimonialTheme(index: number): string {
    return this.testimonials[index % this.testimonials.length].theme || 'teal';
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].clientX;
    const swipeDistance = this.touchStartX - this.touchEndX;
    
    if (Math.abs(swipeDistance) > this.minSwipeDistance) {
      if (swipeDistance > 0) {
        this.nextTestimonial();
      } else {
        this.previousTestimonial();
      }
      this.resetAutoPlay();
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardNavigation(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      this.previousTestimonial();
      this.resetAutoPlay();
    } else if (event.key === 'ArrowRight') {
      this.nextTestimonial();
      this.resetAutoPlay();
    }
  }

  // ==================== SCROLL ANIMATIONS ====================
  
  private initHeroAnimation() {
    const heroSection = document.querySelector('.hero-section');
    
    if (!heroSection) return;

    this.heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            this.heroObserver?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px'
      }
    );

    this.heroObserver.observe(heroSection);
  }

  private initScrollAnimations() {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          
          const staggerElements = entry.target.querySelectorAll('.stagger-item');
          staggerElements.forEach((el, index) => {
            setTimeout(() => {
              el.classList.add('visible');
            }, index * 100);
          });
          
          this.intersectionObserver?.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(
      '.animate-on-scroll, .scroll-fade-in, .scroll-fade-in-up, .fade-in-section'
    );

    animatedElements.forEach(el => {
      this.intersectionObserver?.observe(el);
    });
  }

  // ==================== TRUST SECTION ANIMATION ====================
  
  animateTrustNumbers() {
    const statCards = document.querySelectorAll('.trust-stat-card');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const numberElement = card.querySelector('.stat-number');
          if (numberElement && !numberElement.hasAttribute('data-animated')) {
            const targetCount = parseInt(numberElement.getAttribute('data-count') || '0');
            numberElement.setAttribute('data-animated', 'true');
            
            let current = 0;
            const duration = 1500;
            const step = Math.ceil(targetCount / (duration / 16));
            
            const timer = setInterval(() => {
              current += step;
              if (current >= targetCount) {
                numberElement.textContent = targetCount.toString();
                clearInterval(timer);
              } else {
                numberElement.textContent = current.toString();
              }
            }, 16);
          }
          observer.unobserve(card);
        }
      });
    }, { threshold: 0.3 });
    
    statCards.forEach(card => observer.observe(card));

    // Dynamic animation for Visitors Overview pie chart
    const chartCard = document.querySelector('.visitors-chart-card');
    if (chartCard) {
      const chartObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.chartActive) {
            this.chartActive = true;
            this.animateVisitorsChart();
            chartObserver.disconnect();
          }
        });
      }, { threshold: 0.2 });
      chartObserver.observe(chartCard);
    }
  }

  animateVisitorsChart() {
    const duration = 1500;
    const startTime = performance.now();
    
    const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    
    const animate = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = ease(progress);
      
      this.totalVisitors = Math.round(eased * 50000);
      this.newVisitors = Math.round(eased * 34500);
      this.returningVisitors = Math.round(eased * 15500);
      this.newVisitorsPct = parseFloat((eased * 69).toFixed(2));
      this.returningVisitorsPct = parseFloat((eased * 31).toFixed(2));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.totalVisitors = 50000;
        this.newVisitors = 34500;
        this.returningVisitors = 15500;
        this.newVisitorsPct = 69.00;
        this.returningVisitorsPct = 31.00;
      }
    };
    
    requestAnimationFrame(animate);
  }

  // ==================== SMOOTH SCROLL ====================
  
  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }

  // ==================== STEP NAVIGATION ====================
  
  scrollToStep(stepNumber: number) {
    const stepElement = document.querySelector(`.step-vertical:nth-child(${stepNumber})`);
    if (stepElement) {
      stepElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      stepElement.classList.add('step-highlight');
      setTimeout(() => {
        stepElement.classList.remove('step-highlight');
      }, 1000);
    }
  }

  getStepIcon(stepNumber: number): string {
    const icons = {
      1: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M15 11V9a3 3 0 00-3-3H4a3 3 0 00-3 3v2',
      2: 'M8 9l3 3-3 3m5-6l3 3-3 3',
      3: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    };
    return icons[stepNumber as keyof typeof icons] || icons[1];
  }

  trackCtaClick(source: string) {
    console.log(`CTA clicked from: ${source}`);
  }
}