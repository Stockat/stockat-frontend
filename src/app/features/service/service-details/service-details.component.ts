import { Component } from '@angular/core';
import { Service } from '../../../core/models/service-models/service.dto';
import { ActivatedRoute } from '@angular/router';
import { ServiceService } from '../../../core/services/service.service';
import { CommonModule } from '@angular/common';
import { RequestModalComponent } from '../request-modal/request-modal.component';
import { ServiceRequestService } from '../../../core/services/service-request.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-service-details',
  templateUrl: './service-details.component.html',
  imports: [CommonModule, RequestModalComponent, DialogModule, ButtonModule],
})

export class ServiceDetailsComponent {
  service: Service | null = null;
  isModalOpen = false;
  hasPendingRequest = false;

  constructor(
    private route: ActivatedRoute,
    private serviceService: ServiceService,
    private requestService: ServiceRequestService
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.serviceService.getServiceById(id).subscribe(service => {
      this.service = service;
      // Check for pending request for this service
      this.requestService.getServiceIdsWithPendingRequests().subscribe(serviceIds => {
        this.hasPendingRequest = serviceIds.includes(id);
      })
    });
  }

  openRequestModal() {
    this.isModalOpen = true;
  }

  onRequestSubmitted() {
    this.hasPendingRequest = true;
    this.isModalOpen = false;
  }
}
