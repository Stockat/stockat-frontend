import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-not-found-404',
  imports: [ButtonModule],
  templateUrl: './not-found-404.component.html',
  styleUrl: './not-found-404.component.css'
})
export class NotFound404Component {

  constructor(public router:Router) { }

  // Method to navigate to the homepage
  goToHomepage() {
    window.location.href = '/';
  }
}
