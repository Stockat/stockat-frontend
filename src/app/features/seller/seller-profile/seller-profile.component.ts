import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { CommonModule, Location } from '@angular/common';
import { Service } from '../../../core/models/service-models/service.dto';
import { ServiceService } from '../../../core/services/service.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { PaginatorState } from 'primeng/paginator';
import { TabViewModule } from 'primeng/tabview';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-seller-profile',
  templateUrl: './seller-profile.component.html',
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, Paginator, PaginatorModule, TableModule, TabViewModule, ToastModule],
  providers: [MessageService]
})
export class SellerProfileComponent implements OnInit {
  sellerId!: string;
  seller: any;
  sellerServices: Service[] = [];
  currentUserId: string | null = null;
  // pagination
  totalCount: number = 0;
  page: number = 0; // PrimeNG pages are 0-based
  size: number = 9; // Default page size - works well with 3-column grid

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private serviceService: ServiceService,
    private location: Location,
    private messageService: MessageService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.sellerId = this.route.snapshot.paramMap.get('id')!;
    this.userService.getUserById(this.sellerId).subscribe(seller => {
      console.log('Seller data:', seller);
      this.seller = seller;
    });

    this.fetchSellerServices();
  }

  fetchSellerServices(): void {
    this.serviceService.getSellerServices(this.sellerId, this.page, this.size).subscribe({
      next: (response) => {
        this.sellerServices = response.data.paginatedData;
        this.totalCount = response.data.count;
        this.page = response.data.page;
        this.size = response.data.size;
        console.log('Seller services:', response);
      },
      error: (error) => {
        console.error('Error fetching seller services:', error);
        if (error?.error && typeof error.error === 'string' && error.error.includes('Account is not verified by admin yet.')) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Account Not Verified',
            detail: 'This seller account is not verified by admin yet. Services are not available for public view.',
            life: 6000
          });
        }
      }
    });
  }

    onPageChange(event: PaginatorState): void {
    this.page = event.page ?? 0;
    this.size = event.rows ?? 10;
    this.fetchSellerServices();
    }

  goBack() {
    this.location.back();
  }

  contactSeller() {
    if (this.seller?.data?.id) {
      this.router.navigate(['/chat', this.seller.data.id]);
    }
  }
}
