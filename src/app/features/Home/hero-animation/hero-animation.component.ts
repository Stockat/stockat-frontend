import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-animation.component.html',
  styleUrls: ['./hero-animation.component.css']
})
export class HeroSectionComponent implements OnInit, OnDestroy {
  @ViewChild('roadContainer', { static: true }) roadContainer!: ElementRef;
  
  private vehicleInterval: any;
  private directions = ['left', 'right'];

  constructor() { }

  ngOnInit(): void {
    this.startVehicleAnimation();
  }

  ngOnDestroy(): void {
    if (this.vehicleInterval) {
      clearInterval(this.vehicleInterval);
    }
  }

  onButtonClick(): void {
    // Handle button click - emit event or navigate
    console.log('Hero button clicked!');
  }

  private startVehicleAnimation(): void {
    // Create vehicles periodically
    this.vehicleInterval = setInterval(() => {
      this.createVehicle();
    }, 3000);
  }

  private createVehicle(): void {
    const vehicle = document.createElement('div');
    vehicle.className = 'vehicle';
    
    const direction = this.directions[Math.floor(Math.random() * this.directions.length)];
    const speed = Math.random() * 10 + 8; // 8-18 seconds
    
    vehicle.style.animationName = direction === 'left' ? 'moveLeft' : 'moveRight';
    vehicle.style.animationDuration = speed + 's';
    vehicle.style.animationDelay = Math.random() * 5 + 's';
    
    if (this.roadContainer?.nativeElement) {
      this.roadContainer.nativeElement.appendChild(vehicle);
    }
    
    // Remove vehicle after animation
    setTimeout(() => {
      if (vehicle.parentNode) {
        vehicle.parentNode.removeChild(vehicle);
      }
    }, (speed + 5) * 1000);
  }
}