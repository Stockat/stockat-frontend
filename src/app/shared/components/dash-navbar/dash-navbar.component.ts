import { Component, EventEmitter, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-dash-navbar',
  imports: [MenubarModule, ButtonModule],
  templateUrl: './dash-navbar.component.html',
  styleUrl: './dash-navbar.component.css'
})
export class DashNavbarComponent {

  @Output() toggleSidebar = new EventEmitter();

  constructor(private authService: AuthService, private router: Router) {}

  onToggleSidebar()
  {
    this.toggleSidebar.emit();
  }

  goToAccount() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.authService.logout().subscribe();
  }

}
