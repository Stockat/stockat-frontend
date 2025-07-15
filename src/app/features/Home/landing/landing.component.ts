import { Component } from '@angular/core';
import { HeroSectionComponent } from '../hero-animation/hero-animation.component';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [HeroSectionComponent, ButtonModule, CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  features = [
    {
      icon: 'pi pi-box',
      title: 'Sell Excess Stock',
      description: 'Turn your surplus inventory into profit with our streamlined selling platform.',
      color: 'bg-blue-500'
    },
    {
      icon: 'pi pi-cog',
      title: 'Manufacturing Requests',
      description: 'Connect with manufacturers and fulfill custom production requests.',
      color: 'bg-green-500'
    },
    {
      icon: 'pi pi-briefcase',
      title: 'Service Marketplace',
      description: 'Offer and discover professional services in our B2B ecosystem.',
      color: 'bg-purple-500'
    },
    {
      icon: 'pi pi-gavel',
      title: 'Auction Platform',
      description: 'Bid and sell through our dynamic auction system for maximum value.',
      color: 'bg-orange-500'
    }
  ];

  stats = [
    { number: '', label: 'Be among the first sellers', icon: 'pi pi-users' },
    { number: '', label: 'Your product could be here', icon: 'pi pi-box' },
    { number: '', label: 'Showcase your service', icon: 'pi pi-briefcase' },
    { number: '24/7', label: 'Support Available', icon: 'pi pi-headset' }
  ];

  testimonials = [
    {
      name: 'Sarah Johnson',
      company: 'Tech Manufacturing Co.',
      text: 'Stockat helped us clear our excess inventory and connect with new customers. The platform is incredibly user-friendly.',
      avatar: 'https://imgs.search.brave.com/mDztPWayQWWrIPAy2Hm_FNfDjDVgayj73RTnUIZ15L0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAyLzE1Lzg0LzQz/LzM2MF9GXzIxNTg0/NDMyNV90dFg5WWlJ/SXllYVI3TmU2RWFM/TGpNQW15NEd2UEM2/OS5qcGc'
    },
    {
      name: 'Michael Chen',
      company: 'Global Services Ltd.',
      text: 'The auction feature helped us get the best prices for our products. Highly recommended for B2B transactions.',
      avatar: 'https://imgs.search.brave.com/mDztPWayQWWrIPAy2Hm_FNfDjDVgayj73RTnUIZ15L0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAyLzE1Lzg0LzQz/LzM2MF9GXzIxNTg0/NDMyNV90dFg5WWlJ/SXllYVI3TmU2RWFM/TGpNQW15NEd2UEM2/OS5qcGc'
    }
  ];

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
