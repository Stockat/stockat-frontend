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
import { FormsModule } from '@angular/forms';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

@Component({
  selector: 'app-service-list',
  imports: [TableModule, ButtonModule, PaginatorModule, ToastModule, ConfirmDialogModule, ProgressSpinnerModule, TooltipModule, ServiceEditModalComponent, ServiceAddModalComponent, CommonModule, RouterModule, ToastModule, FormsModule],
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
  accountNotVerified: boolean = false;
  initialized: boolean = false;
  // Remove showDeletedServices flag
  // showDeletedServices: boolean = false;


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

  // Remove getFilteredServices method
  // getFilteredServices(): any[] {
  //   if (this.showDeletedServices) {
  //     return this.services;
  //   }
  //   return this.services.filter(service => !service.isDeleted);
  // }

  // Remove getActiveServicesCount method
  // getActiveServicesCount(): number {
  //   return this.services.filter(service => !service.isDeleted).length;
  // }

  // Truncate text to specified length
  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) : text;
  }

  constructor(
    private serviceService: ServiceService,
    private serviceRequestService: ServiceRequestService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit() {
    this.sellerId = getLoggedInUserId();
    this.loadSellerServices();
  }

  loadSellerServices() {
    if (!this.sellerId) return;
    this.loading = true;
    const apiPage = this.page;

    this.serviceService.getMyServices(apiPage, this.size).subscribe({
      next: (response) => {
        if (response && response.data && response.data.paginatedData) {
          // Only count non-deleted services for pagination
          const allServices = response.data.paginatedData;
          this.services = allServices.filter((service: any) => !service.isDeleted);
          // If the backend count includes deleted, recalculate for paginator
          const nonDeletedCount = response.data.count && Array.isArray(allServices)
            ? allServices.filter((service: any) => !service.isDeleted).length
            : this.services.length;
          this.totalCount = nonDeletedCount;
          // If after delete, current page is empty and not first, go back one page
          if (this.services.length === 0 && this.page > 0) {
            this.page--;
            this.loadSellerServices();
            return;
          }
        } else {
          this.services = [];
          this.totalCount = 0;
        }
        this.loading = false;
        this.initialized = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching services:', error.error.Message);
        this.services = [];
        this.totalCount = 0;
        this.loading = false;
        if (error?.error && error.error.Message.includes('Account is not verified by admin yet.')) {
          this.accountNotVerified = true;
          this.messageService.add({
            severity: 'warn',
            summary: 'Account Not Verified',
            detail: 'Your account is not verified by admin yet. You cannot view or manage services until verification.',
            life: 6000
          });
        }
        this.initialized = true;
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
      message: 'Are you sure you want to delete this service? This action can be undone.',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.serviceService.deleteService(service.id).subscribe({
          next: () => {
            this.loadSellerServices();
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

  // Remove restoreService method
  // restoreService(service: any) {
  //   this.confirmationService.confirm({
  //     message: 'Are you sure you want to restore this service?',
  //     header: 'Restore Confirmation',
  //     icon: 'pi pi-question-circle',
  //     accept: () => {
  //       this.serviceService.restoreService(service.id).subscribe({
  //         next: () => {
  //           this.loadSellerServices(); // Reload to get updated list
  //           this.messageService.add({
  //             severity: 'success',
  //             summary: 'Success',
  //             detail: 'Service has been restored successfully'
  //           });
  //         },
  //         error: (error) => {
  //           const detail = error?.error || 'Failed to restore service';
  //           this.messageService.add({
  //             severity: 'error',
  //             summary: 'Error',
  //             detail
  //           });
  //           console.error('Error restoring service:', error);
  //         }
  //       });
  //     }
  //   });
  // }

  editService(service: any) {
    this.selectedService = service;
    this.editModalVisible = true;
  }

  reactivateService(service: any) {
    this.selectedService = service;
    this.editModalVisible = true; // Reuse the same modal for reactivation
  }

  handleEditModalClose() {
    this.editModalVisible = false;
    this.selectedService = null;
  }

  handleEditModalSave(payload: any) {
    const serviceId = payload.id;
    const isReactivation = this.selectedService.isApproved === 'Rejected';

    // Map frontend fields to backend DTO fields
    const request = {
      EditedName: payload.name,
      EditedDescription: payload.description,
      EditedMinQuantity: payload.minQuantity,
      EditedPricePerProduct: payload.pricePerProduct,
      EditedEstimatedTime: payload.estimatedTime,
      EditedImageId: payload.EditedImageId || this.selectedService.imageId || '',
      EditedImageUrl: payload.EditedImageUrl || this.selectedService.imageUrl || ''
    };

    const submitRequest = (requestData: any) => {
      if (isReactivation) {
        return this.serviceService.submitReactivationRequest(serviceId, requestData);
      } else {
        return this.serviceService.submitEditRequest(serviceId, requestData);
      }
    };

    const successMessage = isReactivation
      ? 'Reactivation request submitted successfully'
      : 'Edit request submitted successfully';

    if (payload.file) {
      this.serviceService.uploadServiceImage(payload.file, serviceId).subscribe({
        next: (imgRes) => {
          request.EditedImageId = imgRes.fileId;
          request.EditedImageUrl = imgRes.url;
          submitRequest(request).subscribe({
            next: () => {
              this.handleEditModalClose();
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: successMessage
              });
            },
            error: (error) => {
              const errorMessage = this.errorHandler.extractErrorMessage(error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: errorMessage
              });
              console.error('Error submitting request:', error);
            }
          });
        },
        error: (error) => {
          const errorMessage = this.errorHandler.extractErrorMessage(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage
          });
          console.error('Error uploading image:', error);
        }
      });
    } else {
      submitRequest(request).subscribe({
        next: () => {
          this.handleEditModalClose();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: successMessage
          });
        },
        error: (error) => {
          const errorMessage = this.errorHandler.extractErrorMessage(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage
          });
          console.error('Error submitting request:', error);
        }
      });
    }
  }

  addService() {
    if (this.accountNotVerified) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Account Not Verified',
        detail: 'Your account is not verified by admin yet. You cannot add services until verification.',
        life: 6000
      });
      return;
    }
    this.addModalVisible = true;
  }

  handleAddModalClose() {
    this.addModalVisible = false;
  }

  async handleAddModalSave(payload: { service: any, file: File | null }) {
    if (this.accountNotVerified) {
      this.addModalVisible = false;
      return;
    }
    this.isAddingService = true;
    if (payload.file) {
      this.serviceService.uploadImage(payload.file).subscribe({
        next: (imgRes) => {
          const serviceWithImage = {
            ...payload.service,
            imageId: imgRes.fileId,
            imageUrl: imgRes.url
          };
          this.serviceService.addService(serviceWithImage).subscribe({
            next: (data) => {
              this.totalCount++;
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
              const errorMessage = this.errorHandler.extractErrorMessage(error);
              if (typeof errorMessage === 'string' && errorMessage.includes('not verified by admin')) {
                this.accountNotVerified = true;
                this.handleAddModalClose();
                this.messageService.add({
                  severity: 'warn',
                  summary: 'Account Not Verified',
                  detail: 'Your account is not verified by admin yet. You cannot add services until verification.',
                  life: 6000
                });
                this.cdr.detectChanges();
                return;
              }
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: errorMessage
              });
              console.error('Error adding service:', error);
            }
          });
        },
        error: (error) => {
          this.isAddingService = false;
          const errorMessage = this.errorHandler.extractErrorMessage(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage
          });
          console.error('Error uploading image:', error);
        }
      });
    } else {
      this.serviceService.addService(payload.service).subscribe({
        next: (data) => {
          this.totalCount++;
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
          const errorMessage = this.errorHandler.extractErrorMessage(error);
          if (typeof errorMessage === 'string' && errorMessage.includes('not verified by admin')) {
            this.accountNotVerified = true;
            this.handleAddModalClose();
            this.messageService.add({
              severity: 'warn',
              summary: 'Account Not Verified',
              detail: 'Your account is not verified by admin yet. You cannot add services until verification.',
              life: 6000
            });
            this.cdr.detectChanges();
            return;
          }
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage
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
