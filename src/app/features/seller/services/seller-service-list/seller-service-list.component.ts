import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ServiceService } from '../../../../core/services/service.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { ServiceEditModalComponent } from "../service-edit-modal/service-edit-modal.component";
import { getLoggedInUserId } from '../../../../shared/utils/get-user-id.util';
import { ServiceAddModalComponent } from '../service-add-modal/service-add-modal.component';
import { ServiceRequestService } from '../../../../core/services/service-request.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-service-list',
  imports: [TableModule, ButtonModule, PaginatorModule, ToastModule, ConfirmDialogModule, ProgressSpinnerModule, TooltipModule, ServiceEditModalComponent, ServiceAddModalComponent, CommonModule, RouterModule],
  templateUrl: './seller-service-list.component.html',
  providers: [MessageService, ConfirmationService]
})
export class SellerServiceListComponent implements OnInit {
  services: any[] = [];
  editModalVisible = false;
  addModalVisible = false;
  selectedService: any = null;
  sellerId: string | null = null;
  isAddingService = false;
  serviceDetailsModalVisible = false;
  selectedServiceRequests: any[] = [];
  totalCount: number = 0;
  page: number = 0; // PrimeNG pages are 0-based
  size: number = 10; // Default page size - match first option in rowsPerPageOptions
  loading: boolean = false;
  selectedServiceForImage: any = null;


  // Computed property for table first position
  get first(): number {
    return this.page * this.size;
  }

  // Calculate average price of services
  getAveragePrice(): string {
    if (!this.services || this.services.length === 0) {
      return '0';
    }
    const total = this.services.reduce((sum, service) => sum + (service.pricePerProduct || 0), 0);
    const average = total / this.services.length;
    return average.toFixed(2);
  }

  constructor(
    private serviceService: ServiceService,
    private serviceRequestService: ServiceRequestService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.sellerId = getLoggedInUserId();
    this.loadSellerServices();
  }

  loadSellerServices() {
    if (!this.sellerId) return;
    this.loading = true;
    const apiPage = this.page;

    this.serviceService.getSellerServices(this.sellerId, apiPage, this.size).subscribe({
      next: (response) => {
        if (response && response.data && response.data.paginatedData) {
          this.services = response.data.paginatedData;
          this.totalCount = response.data.count || 0;
        } else {
          this.services = [];
          this.totalCount = 0;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching services:', error);
        this.services = [];
        this.totalCount = 0;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

onPageChange(event: any) {
  this.page = event.page;
  this.size = event.rows;
  this.loadSellerServices();
  this.cdr.detectChanges();
}


  deleteService(service: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this service?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.serviceService.deleteService(service.id).subscribe({
          next: () => {
            this.services = this.services.filter(s => s.id !== service.id);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Service has been deleted successfully'
            });
          },
          error: (error) => {
            const detail = error?.error || 'Failed to delete service';
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail
            });
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

  handleEditModalSave(payload: any) {
    const serviceId = payload.id;
    // Map frontend fields to backend DTO fields
    const editRequest = {
      EditedName: payload.name,
      EditedDescription: payload.description,
      EditedMinQuantity: payload.minQuantity,
      EditedPricePerProduct: payload.pricePerProduct,
      EditedEstimatedTime: payload.estimatedTime,
      EditedImageId: payload.EditedImageId || '',
      EditedImageUrl: payload.EditedImageUrl || ''
    };
    if (payload.file) {
      this.serviceService.uploadServiceImage(payload.file, serviceId).subscribe({
        next: (imgRes) => {
          editRequest.EditedImageId = imgRes.fileId;
          editRequest.EditedImageUrl = imgRes.url;
          this.serviceService.submitEditRequest(serviceId, editRequest).subscribe({
            next: () => {
              this.handleEditModalClose();
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Edit request submitted successfully'
              });
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to submit edit request'
              });
              console.error('Error submitting edit request:', error);
            }
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to upload image'
          });
        }
      });
    } else {
      this.serviceService.submitEditRequest(serviceId, editRequest).subscribe({
        next: () => {
          this.handleEditModalClose();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Edit request submitted successfully'
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to submit edit request'
          });
          console.error('Error submitting edit request:', error);
        }
      });
    }
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
              // Always reload the current page to get fresh data from server
              this.totalCount++; // Update total count
              this.loadSellerServices();
              this.handleAddModalClose();
              this.isAddingService = false;
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Service added successfully'
              });
            },
            error: (error) => {
              this.isAddingService = false;
              const detail = error?.error || 'Failed to add service';
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail
              });
              console.error('Error adding service:', error);
            }
          });
        },
        error: (error) => {
          this.isAddingService = false;
          const detail = error?.error || 'Failed to upload image';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail
          });
          console.error('Error uploading image:', error);
        }
      });
    } else {
      this.serviceService.addService(payload.service).subscribe({
        next: (data) => {
          // Always reload the current page to get fresh data from server
          this.totalCount++; // Update total count
          this.loadSellerServices();
          this.handleAddModalClose();
          this.isAddingService = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Service added successfully'
          });
        },
        error: (error) => {
          this.isAddingService = false;
          const detail = error?.error || 'Failed to add service';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail
          });
          console.error('Error adding service:', error);
        }
      });
    }
  }

  viewServiceDetails(service: any) {
    this.router.navigate(['/seller/services', service.id]);
  }

  handleServiceDetailsModalClose() {
    this.serviceDetailsModalVisible = false;
    this.selectedService = null;
    this.selectedServiceRequests = [];
  }

  // Add this method to trigger file input
  triggerImageEdit(service: any) {
    this.selectedServiceForImage = service;
    const fileInput = document.getElementById('service-image-input-' + service.id) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  // Handle file input change
  onServiceImageSelected(event: any, service: any) {
    const file: File = event.target.files[0];
    if (file && this.sellerId) {
      this.serviceService.uploadServiceImage(file, service.id).subscribe({
        next: (res) => {
          service.imageUrl = res.url;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Service image updated successfully'
          });
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update service image'
          });
        }
      });
    }
  }


}
