import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ServiceService } from '../../../core/services/service.service';
import { ServiceRequestService } from '../../../core/services/service-request.service';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { Service } from '../../../core/models/service-models/service.dto';
import { GenericRequestModel } from '../../../core/models/generic-request-Dto';
import { PaginationDto } from '../../../core/models/pagination-Dto';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-service-list',
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, FormsModule, PaginatorModule],
  templateUrl: './service-list.component.html',
})
export class ServiceListComponent implements OnInit, OnDestroy {
  services: Service[] = [];
  allServices: Service[] = []; // Store all services for searching
  filteredServices: Service[] = [];
  searchTerm: string = '';
  priceRange: [number, number] = [0, 10000]; // [min, max] price range
  @Input() sellerId?: string;

  // Pagination state
  currentPage: number = 1;
  pageSize: number = 9;
  totalRecords: number = 0;
  totalFilteredRecords: number = 0; // Track filtered count separately

  // Search debounce
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Computed property for paginator (0-based indexing)
  get paginatorCurrentPage(): number {
    return this.currentPage - 1;
  }

  constructor(
    private serviceService: ServiceService,
    private router: Router
  ) {}

  ngOnInit() {
    this.setupSearchDebounce();
    this.loadServices();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchDebounce() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.onSearchOrFilter();
      });
  }

  loadServices() {
    if (this.sellerId) {
      // For seller-specific view, load all services for that seller
      this.serviceService.getSellerServices(this.sellerId, 1, 1000).subscribe({
        next: (response: GenericRequestModel<PaginationDto<Service>>) => {
          if (response.status === 200) {
            this.allServices = response.data.paginatedData;
            this.totalRecords = response.data.count;
            this.applyFilters();
          }
        },
        error: (error) => {
          console.error('Error fetching services:', error);
        }
      });
    } else {
      // For all services view, load all services
      this.serviceService.getAllServices(1, 1000).subscribe({
        next: (response: GenericRequestModel<PaginationDto<Service>>) => {
          if (response.status === 200) {
            this.allServices = response.data.paginatedData;
            this.totalRecords = response.data.count;
            this.applyFilters();
          }
        },
        error: (error) => {
          console.error('Error fetching services:', error);
        }
      });
    }
  }

      applyFilters() {
    let filtered = [...this.allServices];

    // Apply search filter
    if (this.searchTerm && this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchLower) ||
        service.description.toLowerCase().includes(searchLower) ||
        service.sellerName.toLowerCase().includes(searchLower)
      );
    }

    // Apply price range filter
    filtered = filtered.filter(service =>
      service.pricePerProduct >= this.priceRange[0] && service.pricePerProduct <= this.priceRange[1]
    );

    this.totalFilteredRecords = filtered.length;

    // Apply pagination to filtered results
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredServices = filtered.slice(startIndex, endIndex);
  }



  onPageChange(event: any) {
    this.currentPage = event.page + 1; // PrimeNG uses 0-based indexing
    this.pageSize = event.rows;
    this.applyFilters(); // Re-apply filters with new pagination
  }

  onSearchOrFilter() {
    // Apply filters to current data without reloading
    this.applyFilters();
  }

  onSearchChange() {
    // Apply filters immediately
    this.applyFilters();
  }

  deleteService(id: number) {
    this.serviceService.deleteService(id).subscribe({
      next: () => {
        this.services = this.services.filter(service => service.id !== id);
        this.onSearchOrFilter(); // Re-apply filters
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

  navigateToService(serviceId: number) {
    // Navigate to service details page
    this.router.navigate(['/services', serviceId]);
  }

}
