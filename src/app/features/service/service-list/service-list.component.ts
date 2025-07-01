import { Component } from '@angular/core';
import { ServiceService } from '../../../core/services/service.service';
import { ServiceRequestService } from '../../../core/services/service-request.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-service-list',
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, FormsModule],
  templateUrl: './service-list.component.html',
})
export class ServiceListComponent {
  services: any[] = [];
  filteredServices: any[] = [];
  searchTerm: string = '';
  sellerFilter: string = '';
  sellerNames: string[] = [];

  constructor(
    private serviceService: ServiceService,
  ) {}

  ngOnInit() {
    this.serviceService.getAllServices().subscribe({
      next: (data) => {
        this.services = data;
        this.filteredServices = data;
        this.sellerNames = Array.from(new Set(data.map((s: any) => s.sellerName)));
        console.log('Services fetched successfully:', this.services);
      },
      error: (error) => {
        console.error('Error fetching services:', error);
      }
    });
  }

  onSearchOrFilter() {
    this.filteredServices = this.services.filter(service => {
      const matchesName = service.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesSeller = this.sellerFilter ? service.sellerName === this.sellerFilter : true;
      return matchesName && matchesSeller;
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
