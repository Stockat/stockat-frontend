import { Component } from '@angular/core';
import { ServiceService } from '../../../../core/services/service.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ServiceEditModalComponent } from "../service-edit-modal/service-edit-modal.component";
import { getLoggedInUserId } from '../../../../shared/utils/get-user-id.util';
import { ServiceAddModalComponent } from '../service-add-modal/service-add-modal.component';
import { ServiceRequestService } from '../../../../core/services/service-request.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-service-list',
  imports: [TableModule, ButtonModule, ServiceEditModalComponent, ServiceAddModalComponent, CommonModule, RouterModule],
  templateUrl: './seller-service-list.component.html',
})
export class SellerServiceListComponent {
  services: any[] = [];
  editModalVisible = false;
  addModalVisible = false;
  selectedService: any = null;
  sellerId: string | null = null;
  isAddingService = false;
  serviceDetailsModalVisible = false;
  selectedServiceRequests: any[] = [];

  constructor(
    private serviceService: ServiceService,
    private serviceRequestService: ServiceRequestService
  ) {}

  ngOnInit() {
    this.sellerId = getLoggedInUserId();
    this.serviceService.getSellerServices(this.sellerId).subscribe({
      next: (data) => {
        this.services = data;
        console.log('Services fetched successfully:', this.services);
      },
      error: (error) => {
        console.error('Error fetching services:', error.error);
      }
    });
  }

  deleteService(service: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the service.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.serviceService.deleteService(service.id).subscribe({
          next: () => {
            this.services = this.services.filter(s => s.id !== service.id);
            Swal.fire('Deleted!', 'Service has been deleted.', 'success');
          },
          error: (error) => {
            Swal.fire('Error', 'Failed to delete service.', 'error');
            console.error('Error deleting service:', error);
          }
        });
      }
    });
  }

  editService(service: any) {
    this.selectedService = service;
    this.editModalVisible = true;
  }

  handleEditModalClose() {
    this.editModalVisible = false;
    this.selectedService = null;
  }

  handleEditModalSave(updatedService: any) {
    this.serviceService.updateService(updatedService).subscribe({
      next: (data) => {
        this.services = this.services.map(s => s.id === data.id ? data : s);
        this.handleEditModalClose();
        console.log('Service updated successfully:', data);
      },
      error: (error) => {
        console.error('Error updating service:', error);
      }
    });
  }

  addService() {
    this.addModalVisible = true;
  }

  handleAddModalClose() {
    this.addModalVisible = false;
  }

  async handleAddModalSave(payload: { service: any, file: File | null }) {
    this.isAddingService = true;
    if (payload.file) {
      this.serviceService.uploadImage(payload.file).subscribe({
        next: (imgRes) => {
          const serviceWithImage = {
            ...payload.service,
            imageId: imgRes.fileId,
            imageUrl: imgRes.url
          };
          console.log('Image uploaded successfully:', imgRes);
          this.serviceService.addService(serviceWithImage).subscribe({
            next: (data) => {
              this.services.push(data);
              this.handleAddModalClose();
              this.isAddingService = false;
              console.log('Service with image added successfully:', data);
            },
            error: (error) => {
              this.isAddingService = false;
              console.error('Error adding service:', error);
            }
          });
        },
        error: (error) => {
          this.isAddingService = false;
          console.error('Error uploading image:', error);
        }
      });
    } else {
      this.serviceService.addService(payload.service).subscribe({
        next: (data) => {
          this.services.push(data);
          this.handleAddModalClose();
          this.isAddingService = false;
          console.log('Service added successfully:', data);
        },
        error: (error) => {
          this.isAddingService = false;
          console.error('Error adding service:', error);
        }
      });
    }
  }

  viewServiceDetails(service: any) {
    this.selectedService = service;
    this.serviceDetailsModalVisible = true;
    // Fetch buyer requests for this service
    this.serviceRequestService.getSellerRequestsByServiceId(service.id).subscribe({
      next: (requests: any[]) => {
        this.selectedServiceRequests = requests;
      },
      error: (error: any) => {
        this.selectedServiceRequests = [];
        console.error('Error fetching buyer requests:', error);
      }
    });
  }

  handleServiceDetailsModalClose() {
    this.serviceDetailsModalVisible = false;
    this.selectedService = null;
    this.selectedServiceRequests = [];
  }
}
