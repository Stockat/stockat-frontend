import { Component } from '@angular/core';
import { ServiceService } from '../../../core/services/service.service';
import { ServiceRequestService } from '../../../core/services/service-request.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-service-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './service-list.component.html',
  styleUrl: './service-list.component.css'
})
export class ServiceListComponent {
  services: any[] = [];

  constructor(
    private serviceService: ServiceService,
  ) {}

  ngOnInit() {
    this.serviceService.getAllServices().subscribe({
      next: (data) => {
        this.services = data;
      },
      error: (error) => {
        console.error('Error fetching services:', error);
      }
    });


  }

  deleteService(id: number) {
    this.serviceService.deleteService(id).subscribe({
      next: () => {
        this.services = this.services.filter(service => service.id !== id);
        console.log('Service deleted successfully');
      },
      error: (error) => {
        console.error('Error deleting service:', error);
      }
    });
  }

  editService(id: number) {
    // Navigate to the edit service page with the service ID
    // this.router.navigate(['/edit-service', id]);
    console.log('Edit service with ID:', id);
  }

}
