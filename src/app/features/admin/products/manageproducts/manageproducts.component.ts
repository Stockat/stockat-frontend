import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
//* PrimeNg Modules
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

//* Services
import { CategoryService } from '../../../../core/services/category.service';
import { TagService } from '../../../../core/services/tag.service';
import { SharedService } from '../../../../shared/utils/shared.service';
import { viewSellerProductDto } from '../../../../core/models/product-models/viewSellerProductDto';
import { ProductService } from '../../../../core/services/product.service';

//* DTOs
import { ProductFilters } from '../../../../core/models/product-models/product-filters';
import {
  ProductDto,
  ProductStatus,
} from '../../../../core/models/product-models/productDto';

@Component({
  selector: 'app-manageproducts',
  imports: [
    TableModule,
    TagModule,
    RatingModule,
    CommonModule,
    CardModule,
    ButtonModule,
    SelectModule,
    FormsModule,
    MultiSelectModule,
    InputNumberModule,
    PaginatorModule,
    ToggleSwitch,
    ConfirmDialog,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './manageproducts.component.html',
  styleUrl: './manageproducts.component.css',
})
export class ManageproductsComponent {
  //! Testing
  nameAsc: boolean = false;
  //! end testing
  //* Filters Holders
  categories: any = [];
  tags: any = [];
  cities: any = [];
  //* Parameters
  products!: ProductDto[];
  isLoading: boolean = false;
  filters: ProductFilters = {
    location: '',
    category: '',
    tags: [],
    minQuantity: 1,
    minPrice: 1,
    page: 0,
    size: 8,
    sortBy: null,
    filterDirection: 'asc',
  };

  //* Pagination Params
  first: number = 0;
  totalRecords: number = 0;

  //* Filters Params
  SelectedPrice: number = 1;
  SelectedMinQty: number = 1;
  selectedCity: string = '';
  selectedCategory: string = '';
  selectedTags: string[] = [];
  selectedStatus: string = '';
  selectedIsDeleted: string = '';

  //* Filter Options
  statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Activated', value: 'Activated' },
    { label: 'Deactivated', value: 'Deactivated' },
  ];

  deletedOptions = [
    { label: 'All Products', value: '' },
    { label: 'Active Products', value: 'false' },
    { label: 'Deleted Products', value: 'true' },
  ];

  constructor(
    private productServ: ProductService,
    private categoryServ: CategoryService,
    private tagServ: TagService,
    private sharedServ: SharedService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cities = this.sharedServ.governorates;
    this.getCategories();
    this.getTags();
    this.getProducts();
  }

  //* Status Style
  getSeverity(status: string) {
    switch (status) {
      case 'Activated':
        return 'success'; // Green for Activated
      case 'Deactivated':
        return 'danger'; // Red for Deactivated
      case 'Approved':
        return 'success'; // Green for Approved
      case 'Rejected':
        return 'danger'; // Red for Rejected
      case 'Pending':
        return 'warn'; // Red for Rejected
      default:
        return 'danger'; // Fallback
    }
  }

  //* Data For Filter Bar
  getCategories() {
    this.categoryServ.getAllCategories().subscribe({
      next: (response) => {
        console.log('Categories fetched successfully:', response.data);
        this.categories = response.data;
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
      },
    });
  }
  getTags() {
    this.tagServ.getAllTags().subscribe({
      next: (response) => {
        console.log('Tags fetched successfully:', response.data);
        this.tags = response.data;
      },
      error: (error) => {
        console.error('Error fetching tags:', error);
      },
    });
  }

  //* Getting Products
  getProducts() {
    this.isLoading = true;
    this.productServ.getAllProductsPaginatedForAdmin(this.filters).subscribe({
      next: (res) => {
        this.products = res.data.paginatedData;
        this.first = res.data.page;
        this.totalRecords = res.data.count;
        this.isLoading = false;
        console.log('Products fetched successfully:', res.data);
      },
      error: (error) => {
        console.error('Error fetching products:', error);
        this.isLoading = false;
      },
    });
  }

  //* Filters Action
  setFilters() {
    console.log('Location', this.selectedCity);
    console.log('category', this.selectedCategory);
    console.log('Tags', this.selectedTags);
    console.log('Status', this.selectedStatus);
    console.log('IsDeleted', this.selectedIsDeleted);

    this.filters.location = this.selectedCity;
    this.filters.category = this.selectedCategory;
    this.filters.tags = this.selectedTags;
    this.filters.minQuantity = this.SelectedMinQty;
    this.filters.minPrice = this.SelectedPrice;
    this.filters.page = this.first;
    this.filters.size = 8;

    // Add status and isDeleted filters
    if (this.selectedStatus) {
      this.filters.productStatus = this.selectedStatus;
    }
    if (this.selectedIsDeleted) {
      this.filters.isDeleted = this.selectedIsDeleted === 'true';
    }

    console.log('-*****-', this.filters);

    this.getProducts();

    console.log(this.filters);
  }

  resetFilters() {
    this.selectedCity = '';
    this.selectedCategory = '';
    this.selectedTags = [];
    this.selectedStatus = '';
    this.selectedIsDeleted = '';
    this.SelectedMinQty = 1;
    this.SelectedPrice = 1;

    this.filters.location = '';
    this.filters.category = '';
    this.filters.tags = [];
    this.filters.minQuantity = 1;
    this.filters.minPrice = 1;
    this.filters.productStatus = undefined;
    this.filters.isDeleted = undefined;

    this.getProducts();
  }

  //* Pagination Method
  onPageChange(event: PaginatorState) {
    this.first = event.page ?? 0;
    this.setFilters(); // Update filters with the new page number
  }

  //* Image Error Handling
  onImageError(event: any) {
    // Set a default image when the original image fails to load
    event.target.src =
      'https://ik.imagekit.io/woiv2eo8w/back_OCcpj-NRl.png?updatedAt=1736699927368';
  }
  //* Confirmation Dialog
  confirmDelete(event: Event, productId: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this record?',
      header: 'Danger Zone',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
      },

      accept: () => {
        this.confirmationService.close();

        this.productServ.removeProduct(productId).subscribe({
          next: (response) => {
            console.log('Product Removed successfully:', response);
            this.getProducts(); // Refresh the product list after Remove
            this.messageService.add({
              severity: 'success',
              summary: 'Confirmed',
              detail: response.message,
              life: 3000,
            });
          },
          error: (error) => {
            console.error('Error deactivating product:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to deactivate product',
              life: 3000,
            });
          },
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Rejected',
          detail: 'You have rejected',
        });
        this.confirmationService.close();
      },
    });
  }
  confirmDeactivate(event: Event, productId: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to Deactivate  this Product ?',
      header: 'Deactivate Product',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Deactivate',
        severity: 'danger',
      },

      accept: () => {
        this.confirmationService.close(); // Close the confirmation dialog

        this.productServ
          .changeProductStatus(productId, ProductStatus.Deactivated)
          .subscribe({
            next: (response) => {
              console.log('Product deactivated successfully:', response);
              this.getProducts(); // Refresh the product list after deactivation
              this.messageService.add({
                severity: 'success',
                summary: 'Confirmed',
                detail: response.message,
                life: 3000,
              });
            },
            error: (error) => {
              console.error('Error deactivating product:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to deactivate product',
                life: 3000,
              });
            },
          });
      },
      reject: () => {
        this.confirmationService.close(); // Close the confirmation dialog
      },
    });
  }
  confirmActivate(event: Event, productId: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to Activate  this Product ?',
      header: 'Activate Product',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Activate',
        severity: 'success',
      },

      accept: () => {
        this.confirmationService.close(); // Close the confirmation dialog

        this.productServ
          .changeProductStatus(productId, ProductStatus.Pending)
          .subscribe({
            next: (response) => {
              console.log('Product Activated successfully:', response);
              this.getProducts(); // Refresh the product list after deactivation
              this.messageService.add({
                severity: 'success',
                summary: 'Confirmed',
                detail: response.message,
                life: 3000,
              });
            },
            error: (error) => {
              console.error('Error Activating product:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to Activate product',
                life: 3000,
              });
            },
          });
      },
      reject: () => {
        this.confirmationService.close(); // Close the confirmation dialog
      },
    });
  }
  confirmCanBeRequsted(
    event: Event,
    productId: number,
    canbeRequsted: boolean
  ) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message:
        canbeRequsted == true
          ? 'Do you want to Activate Requestable for this Product ?'
          : 'Do you want to Deactivate Requestable for this Product ?',
      header: 'Danger Zone',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label:
          canbeRequsted == true
            ? 'Activate Can Be Requsted'
            : 'Deactivate Can be Requsted',
        severity: canbeRequsted == true ? 'success' : 'danger',
      },

      accept: () => {
        this.confirmationService.close();

        this.productServ.changeProductCanBeRequsted(productId).subscribe({
          next: (response) => {
            console.log('canBeRequsted Field Updated successfully:', response);
            this.getProducts(); // Refresh the product list after Remove
            this.messageService.add({
              severity: 'success',
              summary: 'Confirmed',
              detail: response.message,
              life: 3000,
            });
          },
          error: (error) => {
            console.error('Error deactivating product:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to Update product',
              life: 3000,
            });
          },
        });
      },
      reject: () => {
        this.confirmationService.close();
      },
    });
  }

  //* Accept Product (Pending -> Approved)
  confirmAccept(event: Event, productId: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to Accept this Product?',
      header: 'Accept Product',
      icon: 'pi pi-check-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Accept',
        severity: 'success',
      },

      accept: () => {
        this.confirmationService.close();

        this.productServ
          .changeProductStatus(productId, ProductStatus.Approved)
          .subscribe({
            next: (response) => {
              console.log('Product accepted successfully:', response);
              this.getProducts();
              this.messageService.add({
                severity: 'success',
                summary: 'Confirmed',
                detail: response.message,
                life: 3000,
              });
            },
            error: (error) => {
              console.error('Error accepting product:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to accept product',
                life: 3000,
              });
            },
          });
      },
      reject: () => {
        this.confirmationService.close();
      },
    });
  }

  //* Reject Product (Pending -> Rejected)
  confirmReject(event: Event, productId: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to Reject this Product?',
      header: 'Reject Product',
      icon: 'pi pi-ban',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Reject',
        severity: 'danger',
      },

      accept: () => {
        this.confirmationService.close();

        this.productServ
          .changeProductStatus(productId, ProductStatus.Rejected)
          .subscribe({
            next: (response) => {
              console.log('Product rejected successfully:', response);
              this.getProducts();
              this.messageService.add({
                severity: 'success',
                summary: 'Confirmed',
                detail: response.message,
                life: 3000,
              });
            },
            error: (error) => {
              console.error('Error rejecting product:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to reject product',
                life: 3000,
              });
            },
          });
      },
      reject: () => {
        this.confirmationService.close();
      },
    });
  }


  //* View Details
  viewDetails(productId: number) {
    this.router.navigate(['/product-stocks', productId]);
  }




}
