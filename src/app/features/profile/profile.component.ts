import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserService } from '../../core/services/user.service';
import { UserReadDto } from '../../core/models/user-models/user-read.dto';
import { UserUpdateDto } from '../../core/models/user-models/user-update.dto';
import { ChangePasswordDto } from '../../core/models/user-models/change-password.dto';
import { UserVerificationCreateDto } from '../../core/models/user-models/user-verification-create.dto';
import { UserVerificationReadDto } from '../../core/models/user-models/user-verification-read.dto';
import { UserVerificationUpdateDto } from '../../core/models/user-models/user-verification-update.dto';
import { AuthService } from '../../core/services/auth.service';
import { ServiceRequestService } from '../../core/services/service-request.service';
import {
  RouterModule,
  Router,
  ActivatedRoute,
  NavigationEnd,
} from '@angular/router';
import { ServiceRequestDetailsComponent } from './service-request-details.component';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { PaginatorModule } from 'primeng/paginator';
import { PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { OrderDetailsComponent } from './order-details.component';
import { OrderRequestDetailsComponent } from './order-request-details.component';
import { AuctionOrderManagementComponent } from '../seller/Auctions/auction-order-management/auction-order-management.component';
import { BuyerBidsComponent } from '../Auction/buyer-bids/buyer-bids.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    ToastModule,
    ConfirmDialogModule,
    RouterModule,
    ServiceRequestDetailsComponent,
    FormsModule,
    PaginatorModule,
    TableModule,
    DropdownModule,
    ProgressSpinnerModule,
    TagModule,
    TooltipModule,
    OrderDetailsComponent,
    OrderRequestDetailsComponent,
    AuctionOrderManagementComponent,
    BuyerBidsComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [MessageService, ConfirmationService],
})
export class ProfileComponent implements OnInit, OnDestroy {
  activeTab: string = 'about';
  user: UserReadDto | null = null;
  loading = false;
  error: string | null = null;
  editForm: FormGroup;
  editMode = false;
  originalUser: UserReadDto | null = null;
  changePasswordForm: FormGroup;
  verification: UserVerificationReadDto | null = null;
  verificationLoading = false;
  deactivateLoading = false;
  verifyForm: FormGroup;
  changePasswordLoading = false;
  submitted = false;
  buyerRequests: any[] = [];
  buyerRequestsLoading = false;
  isDetailsRoute = false;
  buyerRequestDetailsId: number = 0;
  searchTerm: string = '';
  statusFilter: string = '';
  filteredRequests: any[] = [];

  // Pagination properties for requests
  totalRequests: number = 0;
  requestsPage: number = 0;
  requestsSize: number = 10;

  private navigationSubscription: any;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private serviceRequestService: ServiceRequestService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.editForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      address: [''],
      city: [''],
      country: [''],
      postalCode: [''],
      aboutMe: [''],
    });
    this.editForm.disable();
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.verifyForm = this.fb.group({
      nationalId: [
        '',
        [Validators.required, Validators.pattern(/^[2-3]\d{13}$/)],
      ],
      image: [null],
      imagePreview: [''],
    });
    this.router.events.subscribe(() => {
      this.isDetailsRoute = !!this.route.firstChild;
    });
    // Listen for navigation events to refresh requests list
    this.navigationSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.activeTab === 'requests') {
          this.fetchBuyerRequests();
        }
      });
  }

  ngOnInit() {
    this.fetchUser();
    this.fetchUserVerification();
    this.filterRequests();
  }

  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    this.buyerRequestDetailsId = 0;
    if (tab !== 'edit') {
      this.editMode = false;
      this.editForm.disable();
    }
    if (tab === 'verify') {
      this.fetchUserVerification();
    }
    if (tab === 'requests') {
      this.fetchBuyerRequests();
    }
  }

  fetchUser() {
    this.loading = true;
    this.userService.getCurrentUser().subscribe({
      next: (res) => {
        this.user = res.data;
        if (this.user) {
          // Only patch the properties that exist in the form
          this.editForm.patchValue({
            firstName: this.user.firstName,
            lastName: this.user.lastName,
            email: this.user.email,
            phoneNumber: this.user.phoneNumber || '',
            address: this.user.address,
            city: this.user.city,
            country: this.user.country,
            postalCode: this.user.postalCode,
            aboutMe: this.user.aboutMe
          });
        }
        this.editForm.disable();
        this.loading = false;
        console.log('User data loaded:', this.user);
        console.log('Loaded roles:', this.user?.roles);
      },
      error: (err) => {
        this.error = 'Failed to load user data.';
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Load Failed',
          detail: 'Failed to load user data.',
        });
      },
    });
  }

  fetchUserVerification() {
    // this.verificationLoading = true;
    this.userService.getUserVerification().subscribe({
      next: (res) => {
        this.verification = res.data;
        // this.verificationLoading = false;
        if (this.verification) {
          this.verifyForm.patchValue({
            nationalId: this.verification.nationalId,
            image: null,
            imagePreview: '',
          });
        } else {
          this.verifyForm.reset();
        }
      },
      error: (err) => {
        this.verification = null;
        // this.verificationLoading = false;
        this.verifyForm.reset();
      },
    });
  }

  enableEdit() {
    this.editMode = true;
    this.originalUser = this.user ? { ...this.user } : null;
    this.editForm.enable();
  }

  onEditButtonClick() {
    if (!this.editMode) {
      this.enableEdit();
    } else {
      this.onEditSubmit();
    }
  }

  onEditSubmit() {
    if (this.editForm.valid) {
      this.confirmationService.confirm({
        message: 'Are you sure you want to update your profile?',
        header: 'Confirm Update',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.updateUser(this.editForm.value);
          this.editMode = false;
        },
        reject: () => {
          // Revert form to original user data
          if (this.originalUser) {
            this.editForm.patchValue(this.originalUser);
          }
          this.editForm.disable();
          this.editMode = false;
        },
      });
    }
  }

  updateUser(dto: UserUpdateDto) {
    this.loading = true;
    this.userService.updateUser(dto).subscribe({
      next: (res) => {
        this.user = res.data;
        if (this.user) {
          // Only patch the properties that exist in the form
          this.editForm.patchValue({
            firstName: this.user.firstName,
            lastName: this.user.lastName,
            email: this.user.email,
            phoneNumber: this.user.phoneNumber || '',
            address: this.user.address,
            city: this.user.city,
            country: this.user.country,
            postalCode: this.user.postalCode,
            aboutMe: this.user.aboutMe
          });
        }
        this.editForm.disable();
        this.editMode = false;
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Profile Updated',
          detail: 'Your profile has been updated successfully.',
        });
      },
      error: (err) => {
        this.error = 'Failed to update user.';
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Update Failed',
          detail: 'Failed to update your profile.',
        });
      },
    });
  }

  updateProfileImage(file: File) {
    this.loading = true;
    this.userService.updateProfileImage(file).subscribe({
      next: (res) => {
        console.log('Profile image updated:', res);
        if (this.user) {
          this.user.profileImageUrl = res.data;
        }
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Image Updated',
          detail: 'Profile image updated successfully.',
        });
      },
      error: (err) => {
        this.error = 'Failed to update profile image.';
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Image Update Failed',
          detail: 'Failed to update profile image.',
        });
      },
    });
  }

  changePassword(dto: ChangePasswordDto) {
    this.loading = true;
    this.userService.changePassword(dto).subscribe({
      next: (res) => {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Password Changed',
          detail: 'Your password has been changed successfully.',
        });
      },
      error: (err) => {
        this.error = 'Failed to change password.';
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Password Change Failed',
          detail: 'Failed to change password.',
        });
      },
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid File',
          detail: 'Please select an image file.',
        });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: 'File Too Large',
          detail: 'Please select an image smaller than 5MB.',
        });
        return;
      }
      // Show confirmation dialog
      this.confirmationService.confirm({
        message: 'Are you sure you want to update your profile image?',
        header: 'Confirm Image Update',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.updateProfileImage(file);
        },
        reject: () => {
          // Do nothing, user cancelled
        },
      });
    }
  }

  onChangePasswordSubmit() {
    if (this.changePasswordForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Input',
        detail:
          'Please fill in both fields. New password must be at least 6 characters.',
      });
      return;
    }
    const dto = {
      currentPassword: this.changePasswordForm.value.currentPassword,
      newPassword: this.changePasswordForm.value.newPassword,
    };
    this.changePasswordLoading = true;
    this.confirmationService.confirm({
      message: 'Are you sure you want to change your password?',
      header: 'Confirm Password Change',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.changePassword(dto).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Password Changed',
              detail: 'Your password has been changed successfully.',
            });
            this.changePasswordForm.reset();
            this.changePasswordLoading = false;
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Change Failed',
              detail: err?.error?.message || 'Failed to change password.',
            });
            this.changePasswordLoading = false;
          },
        });
      },
      reject: () => {
        this.changePasswordLoading = false;
      },
    });
  }

  createUserVerification(form: FormGroup) {
    this.submitted = true;
    if (form.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Input',
        detail: 'Please fill in all fields and upload an image.',
      });
      return;
    }
    const dto: UserVerificationCreateDto = {
      nationalId: form.value.nationalId,
      image: form.value.image,
    };
    this.confirmationService.confirm({
      message: 'Are you sure you want to submit your verification documents?',
      header: 'Confirm Verification',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.verificationLoading = true;
        this.userService.createUserVerification(dto).subscribe({
          next: (res) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Submitted',
              detail: 'Verification submitted successfully.',
            });
            this.fetchUserVerification();
            form.reset();
            this.verificationLoading = false;
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: err?.error?.message || 'Failed to submit verification.',
            });
            this.verificationLoading = false;
          },
        });
      },
    });
  }

  updateUserVerification(form: FormGroup) {
    if (form.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Input',
        detail: 'Please fill in all fields.',
      });
      return;
    }
    const dto: UserVerificationUpdateDto = {
      nationalId: form.value.nationalId,
      image: form.value.image,
    };
    this.confirmationService.confirm({
      message: 'Are you sure you want to update your verification documents?',
      header: 'Confirm Update',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.verificationLoading = true;
        this.userService.updateUserVerification(dto).subscribe({
          next: (res) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Updated',
              detail: 'Verification updated successfully.',
            });
            this.fetchUserVerification();
            form.reset();
            this.verificationLoading = false;
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: err?.error?.message || 'Failed to update verification.',
            });
            this.verificationLoading = false;
          },
        });
      },
    });
  }

  deleteUserVerification() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete your verification entry?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.verificationLoading = true;
        this.userService.deleteUserVerification().subscribe({
          next: (res) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Verification entry deleted.',
            });
            this.fetchUserVerification();
            this.verificationLoading = false;
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: err?.error?.message || 'Failed to delete verification.',
            });
            this.verificationLoading = false;
          },
        });
      },
    });
  }

  deactivateUser() {
    this.confirmationService.confirm({
      message:
        'Are you sure you want to deactivate your account? This action cannot be undone.',
      header: 'Confirm Deactivation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deactivateLoading = true;
        this.userService.toggleUserActivation().subscribe({
          next: (res) => {
            this.authService.clearTokens();
            localStorage.setItem('showDeactivatedToast', '1');
            window.location.href = '/login';
            this.deactivateLoading = false;
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: err?.error?.Message || 'Failed to deactivate account.',
            });
            this.deactivateLoading = false;
          },
        });
      },
    });
  }

  fetchBuyerRequests() {
    this.buyerRequestsLoading = true;
    // Convert 0-based page to 1-based for API
    const apiPage = this.requestsPage + 1;
    console.log(
      'Fetching buyer requests - Page:',
      apiPage,
      'Size:',
      this.requestsSize
    );

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn('Buyer requests fetch timed out');
      this.buyerRequestsLoading = false;
      this.buyerRequests = [];
      this.totalRequests = 0;
    }, 10000); // 10 second timeout

    this.serviceRequestService
      .getBuyerRequests(apiPage, this.requestsSize)
      .subscribe({
        next: (res) => {
          clearTimeout(timeout); // Clear timeout on success
          console.log('Buyer requests API response:', res);

          if (res && res.data) {
            this.buyerRequests = res.data.paginatedData || res.data;
            this.totalRequests = res.data.count || this.buyerRequests.length;
            // Convert 1-based page back to 0-based for PrimeNG
            this.requestsPage = (res.data.page || 1) - 1;
            this.requestsSize = res.data.size || 10;
          } else {
            // Handle case where response is direct array
            this.buyerRequests = Array.isArray(res) ? res : [];
            this.totalRequests = this.buyerRequests.length;
          }

          console.log('Processed buyer requests:', this.buyerRequests);
          console.log('Total requests:', this.totalRequests);
          console.log('Current page:', this.requestsPage);
          console.log('Page size:', this.requestsSize);

          this.filterRequests();
          this.buyerRequestsLoading = false;
        },
        error: (err) => {
          clearTimeout(timeout); // Clear timeout on error
          console.error('Error fetching buyer requests:', err);
          this.buyerRequests = [];
          this.totalRequests = 0;
          this.filterRequests();
          this.buyerRequestsLoading = false;
        },
      });
  }

  showRequestDetails(id: number) {
    this.buyerRequestDetailsId = id;
  }

  onVerifyImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.verifyForm.patchValue({ image: file });
      const reader = new FileReader();
      reader.onload = () => {
        this.verifyForm.patchValue({ imagePreview: reader.result });
      };
      reader.readAsDataURL(file);
    }
  }

  filterRequests() {
    this.filteredRequests = this.buyerRequests.filter((req) => {
      const matchesSearch =
        !this.searchTerm ||
        (req.serviceTitle &&
          req.serviceTitle
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())) ||
        (req.sellerName &&
          req.sellerName.toLowerCase().includes(this.searchTerm.toLowerCase()));
      const matchesStatus =
        !this.statusFilter || req.serviceStatus === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  onRequestsPageChange(event: PaginatorState) {
    this.requestsPage = event.page ?? 0;
    this.requestsSize = event.rows ?? 10;
    this.fetchBuyerRequests();
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'Pending':
        return 'warning';
      case 'InProgress':
        return 'info';
      case 'Delivered':
        return 'success';
      case 'Cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getBuyerStatusSeverity(status: string): string {
    switch (status) {
      case 'Pending':
        return 'warning';
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'danger';
      default:
        return 'warning';
    }
  }

  // Computed properties for stats
  get pendingRequestsCount(): number {
    return (this.buyerRequests || []).filter(
      (r) => r.serviceStatus === 'Pending'
    ).length;
  }

  get approvedRequestsCount(): number {
    return (this.buyerRequests || []).filter(
      (r) => r.buyerApprovalStatus === 'Approved'
    ).length;
  }

  get rejectedRequestsCount(): number {
    return (this.buyerRequests || []).filter(
      (r) => r.buyerApprovalStatus === 'Rejected'
    ).length;
  }

  get totalRequestsCount(): number {
    return (this.buyerRequests || []).length;
  }

  hasSellerOffer(request: any): boolean {
    return (
      request.pricePerProduct != null &&
      request.pricePerProduct !== 0 &&
      request.estimatedTime != null &&
      request.estimatedTime.trim() !== ''
    );
  }

  upgradeToSeller() {
    if (this.user && this.user.roles && this.user.roles.includes('Seller')) {
      this.messageService.add({
        severity: 'info',
        summary: 'Already a Seller',
        detail: 'You are already a seller.'
      });
      return;
    }
    this.userService.upgradeToSeller().subscribe({
      next: (res) => {
        if (res.token) {
          this.authService.setTokens(res.token);
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Upgraded',
          detail: 'You are now a seller!'
        });
        this.fetchUser(); // Refresh user info to update roles
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Upgrade Failed',
          detail: err?.error?.message || 'Failed to upgrade to seller.'
        });
      }
    });
  }

  isSeller(): boolean {
    return this.authService.getCurrentUserRoles().includes('Seller');
  }
}
