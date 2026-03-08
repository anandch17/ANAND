import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './landing.component.html',
  // No styleUrls — all styles are inline or Tailwind
})
export class LandingComponent implements OnInit, OnDestroy {

  isScrolled = false;

  searchForm = {
    destination: '',
    departure: '',
    returnDate: '',
    travelers: '1 Traveler',
  };

  navLinks = [
    { label: 'Coverage', id: 'features' },
    { label: 'Plans', id: 'plans' },
    { label: 'How It Works', id: 'how' },
    { label: 'Reviews', id: 'testimonials' },
    { label: 'Contact', id: 'contact' },
  ];

  stats = [
    { val: '2M+', label: 'Policies Issued' },
    { val: '180+', label: 'Countries Covered' },
    { val: '99.2%', label: 'Claims Approved' },
    { val: '24/7', label: 'Support Available' },
  ];

  features = [
    {
      icon: '🏥',
      iconBg: 'linear-gradient(135deg,#DBEAFE,#BFDBFE)',
      title: 'Medical Emergency',
      desc: 'Up to $5M in emergency medical coverage including evacuation, hospitalization, and specialist care abroad.',
    },
    {
      icon: '✈️',
      iconBg: 'linear-gradient(135deg,#E0F2FE,#BAE6FD)',
      title: 'Flight Cancellation',
      desc: 'Full reimbursement for cancelled, delayed, or missed flights due to covered reasons — no questions asked.',
    },
    {
      icon: '🧳',
      iconBg: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)',
      title: 'Baggage Protection',
      desc: 'Coverage for lost, stolen, or damaged luggage and personal belongings — get reimbursed quickly.',
    },
    {
      icon: '⚡',
      iconBg: 'linear-gradient(135deg,#FEF3C7,#FDE68A)',
      title: 'Adventure Sports',
      desc: 'Skiing, scuba diving, bungee jumping — we cover adventure activities that most insurers won\'t.',
    },
    {
      icon: '🌐',
      iconBg: 'linear-gradient(135deg,#FCE7F3,#FBCFE8)',
      title: '24/7 Global Support',
      desc: 'Our multilingual support team is always reachable — call, chat, or app. Wherever you are, we\'re there.',
    },
    {
      icon: '📱',
      iconBg: 'linear-gradient(135deg,#EDE9FE,#DDD6FE)',
      title: 'Instant Claims App',
      desc: 'File and track claims in minutes using our mobile app. Most claims processed within 48 hours.',
    },
  ];

  plans = [
    {
      name: 'Essentials',
      price: '29',
      desc: 'Perfect for short domestic trips and budget travelers.',
      featured: false,
      badge: null,
      features: [
        'Up to $100K medical',
        'Trip cancellation ($2,000)',
        'Lost baggage ($500)',
        '24/7 phone support',
        'Emergency evacuation',
      ],
    },
    {
      name: 'Explorer',
      price: '59',
      desc: 'Ideal for international trips with full coverage.',
      featured: true,
      badge: 'Most Popular',
      features: [
        'Up to $1M medical',
        'Trip cancellation ($10,000)',
        'Lost baggage ($2,000)',
        'Adventure sports',
        '24/7 app + phone support',
        'Flight delay ($500)',
      ],
    },
    {
      name: 'Elite',
      price: '99',
      desc: 'The ultimate protection for frequent globe-trotters.',
      featured: false,
      badge: null,
      features: [
        'Up to $5M medical',
        'Trip cancellation ($25,000)',
        'Lost baggage ($5,000)',
        'All adventure sports',
        'Concierge support',
        'Cancel for any reason',
      ],
    },
  ];

  steps = [
    {
      num: '1',
      title: 'Choose Your Plan',
      desc: 'Browse our coverage options and pick the plan that matches your trip type, duration, and budget.',
    },
    {
      num: '2',
      title: 'Enter Trip Details',
      desc: 'Fill in your destination, travel dates, and traveler info. Takes less than 2 minutes — we promise.',
    },
    {
      num: '3',
      title: 'Fly with Confidence',
      desc: 'Receive your policy instantly by email. Our app keeps all your documents accessible offline.',
    },
  ];

  testimonials = [
    {
      initials: 'A',
      avatarBg: 'linear-gradient(135deg,#2563EB,#06B6D4)',
      quote: 'My luggage got lost in Bangkok and SkyShield reimbursed me within 24 hours. Absolutely seamless experience.',
      name: 'Aarav Mehta',
      role: 'Solo Traveler, Mumbai',
    },
    {
      initials: 'S',
      avatarBg: 'linear-gradient(135deg,#7C3AED,#A78BFA)',
      quote: 'Had a skiing accident in Switzerland. The medical team arranged by SkyShield was incredible. Couldn\'t ask for better support.',
      name: 'Sara Lindqvist',
      role: 'Adventure Traveler, Stockholm',
    },
    {
      initials: 'R',
      avatarBg: 'linear-gradient(135deg,#0891B2,#06B6D4)',
      quote: 'As a family of five, we travel 3–4 times a year. SkyShield\'s family pack saves us money and stress every single time.',
      name: 'Ravi & Priya Sharma',
      role: 'Family Travelers, Hyderabad',
    },
  ];

  partners = ['Lloyd\'s of London', 'IRDAI Certified', 'IATA Partner', 'ISO 27001', 'PCI DSS Secure', 'GDPR Compliant'];

  footerCoverage = ['Medical Emergency', 'Trip Cancellation', 'Baggage Loss', 'Adventure Sports', 'Annual Plans'];
  footerCompany = ['About Us', 'How It Works', 'Careers', 'Press', 'Blog'];
  footerSupport = ['File a Claim', 'FAQs', 'Contact Us', 'Emergency Line', 'Partner Portal'];

  private observer!: IntersectionObserver;

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 30;
  }

  ngOnInit(): void {
    // Inject keyframe animations into <head> once (no scss file needed)
    this.injectGlobalStyles();

    // Scroll-reveal observer
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              (entry.target as HTMLElement).classList.add('visible');
            }, i * 90);
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    // Delay slightly so Angular renders the DOM first
    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach((el) => this.observer.observe(el));
    }, 150);
  }

  ngOnDestroy(): void {
    if (this.observer) this.observer.disconnect();
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  /** Inject all keyframe animations + reveal styles programmatically — no scss file needed */
  private injectGlobalStyles(): void {
    const styleId = 'skyshield-animations';
    if (document.getElementById(styleId)) return; // Already injected

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

      html { scroll-behavior: smooth; }

      /* Reveal animation */
      .reveal {
        opacity: 0;
        transform: translateY(28px);
        transition: opacity 0.7s ease, transform 0.7s ease;
      }
      .reveal.visible {
        opacity: 1;
        transform: translateY(0);
      }

      /* Orb float */
      @keyframes floatOrb {
        from { transform: translateY(0) scale(1); }
        to   { transform: translateY(-30px) scale(1.05); }
      }

      /* Hero fade-up entrance */
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(28px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      /* Badge pulse dot */
      @keyframes pulseDot {
        0%, 100% { transform: scale(1); opacity: 1; }
        50%       { transform: scale(1.5); opacity: 0.6; }
      }

      /* Globe float */
      @keyframes floatGlobe {
        from { transform: translateY(0); }
        to   { transform: translateY(-18px); }
      }

      /* Planes */
      @keyframes flyPlane {
        from { transform: translateX(0) rotate(-10deg); }
        to   { transform: translateX(110vw) rotate(-10deg); }
      }
    `;
    document.head.appendChild(style);
  }
}