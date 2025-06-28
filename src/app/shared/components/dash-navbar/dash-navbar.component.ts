import { Component, EventEmitter, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';


@Component({
  selector: 'app-dash-navbar',
  imports: [MenubarModule,ButtonModule],
  templateUrl: './dash-navbar.component.html',
  styleUrl: './dash-navbar.component.css'
})
export class DashNavbarComponent {

  @Output() toggleSidebar = new EventEmitter();

  onToggleSidebar()
  {
    this.toggleSidebar.emit();
  }

}
