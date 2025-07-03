import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { ServiceListComponent } from '../../service/service-list/service-list.component';
import { CommonModule } from '@angular/common';
import { Service } from '../../../core/models/service-models/service.dto';
import { ServiceService } from '../../../core/services/service.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';


@Component({
  selector: 'app-seller-profile',
  templateUrl: './seller-profile.component.html',
  imports: [CommonModule, RouterLink, CardModule, ButtonModule],
})
export class SellerProfileComponent implements OnInit {
  sellerId!: string;
  seller: any;
  sellerServices: Service[] = [];

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private serviceService: ServiceService
  ) {}

  ngOnInit(): void {
    this.sellerId = this.route.snapshot.paramMap.get('id')!;
    this.userService.getUserById(this.sellerId).subscribe(seller => {
      console.log('Seller data:', seller);
      this.seller = seller;
    });

    this.serviceService.getSellerServices(this.sellerId).subscribe({
      next: (data) => {
        this.sellerServices = data;
      },
      error: (error) => {
        console.error('Error fetching seller services:', error);
      }
    });
  }
}
