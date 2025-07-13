import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CalendarModule } from 'primeng/calendar';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserService } from '../../../core/services/user.service';
import { UserReadDto } from '../../../core/models/user-models/user-read.dto';
import { PaginatedDto } from '../../../core/models/user-models/paginated-dto';
import { GenericResponseDto } from '../../../core/models/user-models/generic-response.dto';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    DropdownModule,
    PaginatorModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    TagModule,
    TooltipModule,
    CalendarModule
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class UserManagementComponent implements OnInit, OnDestroy {
  users: UserReadDto[] = [];
  selectedUser: UserReadDto | null = null;
  loading = false;
  totalUsers = 0;
  currentPage = 1;
  pageSize = 5;
  
  // Filters
  searchTerm = '';
  statusFilter: string = '';
  verificationFilter: string = '';
  blockedFilter: string = '';
  
  // Dialog states
  showUserDetails = false;
  showPunishmentDialog = false;
  showVerificationDialog = false;
  punishmentLoading = false;
  
  // Forms
  punishmentForm: FormGroup;
  
  // Statistics
  statistics = {
    total: 0,
    active: 0,
    inactive: 0,
    verified: 0,
    unverified: 0,
    blocked: 0
  };

  searchTermChanged: Subject<string> = new Subject<string>();
  private searchSubscription: any;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.punishmentForm = this.fb.group({
      type: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]],
      endDate: [null]
    });
  }

  ngOnInit() {
    this.loadUsers();
    this.loadStatistics();

    this.userService.getUserStatistics().subscribe({
      next: (response) => {
        if (response.data) {
          this.statistics.total = response.data.total;
          this.statistics.active = response.data.active;
          this.statistics.inactive = response.data.inactive;
          this.statistics.verified = response.data.verified;
          this.statistics.unverified = response.data.unverified;
          this.statistics.blocked = response.data.blocked;
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load user statistics'
        });
      }
    });

    this.searchSubscription = this.searchTermChanged.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(term => {
      this.currentPage = 1;
      this.loadUsers();
    });
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  loadUsers() {
    this.loading = true;
    
    const params = {
      page: this.currentPage,
      size: this.pageSize,
      searchTerm: this.searchTerm || undefined,
      isActive: this.statusFilter === 'active' ? true : this.statusFilter === 'inactive' ? false : undefined,
      isVerified: this.verificationFilter === 'verified' ? true : this.verificationFilter === 'unverified' ? false : undefined,
      isBlocked: this.blockedFilter === 'blocked' ? true : this.blockedFilter === 'notBlocked' ? false : undefined
    };

    this.userService.getAllUsers(
      params.page,
      params.size,
      params.searchTerm,
      params.isActive,
      params.isVerified,
      params.isBlocked
    ).subscribe({
      next: (response: GenericResponseDto<PaginatedDto<UserReadDto[]>>) => {
        this.users = response.data.paginatedData;
        this.totalUsers = response.data.count;
        this.loading = false;
        // Debug: print userVerification for each user
        this.users.forEach(user => {
          console.log('User:', user.userName, 'Verification:', user.userVerification);
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load users'
        });
        this.loading = false;
      }
    });
  }

  loadStatistics() {
    // This would be implemented when we add statistics endpoint
    // For now, we'll calculate from the users array
  }

  onPageChange(event: any) {
    this.currentPage = event.page + 1;
    this.pageSize = event.rows;
    this.loadUsers();
  }

  onSearch() {
    this.currentPage = 1;
    this.loadUsers();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadUsers();
  }

  viewUserDetails(user: UserReadDto) {
    this.selectedUser = user;
    this.showUserDetails = true;
  }

  toggleUserActivation(user: UserReadDto) {
    const action = user.isDeleted ? 'activate' : 'deactivate';
    const confirmMsg = user.isDeleted
      ? `Are you sure you want to activate ${user.firstName} ${user.lastName}?`
      : `Are you sure you want to deactivate ${user.firstName} ${user.lastName}?`;
    const confirmHeader = user.isDeleted ? 'Confirm Activation' : 'Confirm Deactivation';
    const confirmIcon = user.isDeleted ? 'pi pi-check-circle' : 'pi pi-ban';
    this.confirmationService.confirm({
      message: confirmMsg,
      header: confirmHeader,
      icon: confirmIcon,
      accept: () => {
        const obs = user.isDeleted
          ? this.userService.activateUser(user.id)
          : this.userService.deactivateUser(user.id);
        obs.subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: user.isDeleted ? 'User activated successfully' : 'User deactivated successfully'
            });
            this.loadUsers();
            this.userService.getUserStatistics().subscribe({
              next: (response) => {
                if (response.data) {
                  this.statistics.total = response.data.total;
                  this.statistics.active = response.data.active;
                  this.statistics.inactive = response.data.inactive;
                  this.statistics.verified = response.data.verified;
                  this.statistics.unverified = response.data.unverified;
                  this.statistics.blocked = response.data.blocked;
                }
              }
            });
          },
          error: (error) => {
            console.log(error);
            this.messageService.add({
              
              severity: 'error',
              summary: 'Failed',
              detail: user.isDeleted ?  'Failed to activate user' : error?.error?.Message || 'Failed to deactivate user'
            });
          }
        });
      }
    });
  }

  openPunishmentDialog(user: UserReadDto) {
    this.selectedUser = user;
    this.punishmentForm.reset();
    this.showPunishmentDialog = true;
  }

  submitPunishment() {
    // Mark all controls as touched to trigger validation
    this.punishmentForm.markAllAsTouched();

    if (this.punishmentForm.valid && this.selectedUser) {
      this.punishmentLoading = true;
      const type = this.punishmentForm.value.type;
      const punishmentData = {
        userId: this.selectedUser.id,
        type: type,
        reason: this.punishmentForm.value.reason,
        endDate: type === 'TemporaryBan' ? this.punishmentForm.value.endDate : null
      };

      this.userService.createPunishment(punishmentData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Punishment applied successfully'
          });
          this.showPunishmentDialog = false;
          this.punishmentLoading = false;
          this.loadUsers();
        },
        error: (error) => {
          console.error('Punishment error:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error?.error?.Message || error?.error || 'Failed to apply punishment'
          });
          this.punishmentLoading = false;
        }
      });
    }
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      default: return 'secondary';
    }
  }

  getVerificationSeverity(status: string): string {
    switch (status) {
      case 'verified': return 'success';
      case 'unverified': return 'warning';
      default: return 'secondary';
    }
  }

  getPunishmentSeverity(punishment: any): string {
    if (!punishment) return 'success';
    switch (punishment.type) {
      case 'Warning': return 'warning';
      case 'TemporaryBan': return 'danger';
      case 'PermanentBan': return 'danger';
      default: return 'success';
    }
  }

  getRoleBadge(roles: string[]): string {
    if (roles.includes('Admin')) return 'Admin';
    if (roles.includes('Seller')) return 'Seller';
    return 'User';
  }

  getRoleSeverity(roles: string[]): string {
    if (roles.includes('Admin')) return 'danger';
    if (roles.includes('Seller')) return 'success';
    return 'info';
  }

  getCurrentDate(): Date {
    return new Date();
  }

  onSearchTermChange(term: string) {
    this.searchTermChanged.next(term);
  }

  // Optional: Add a getter for easy access in template
  get punishmentReason() {
    return this.punishmentForm.get('reason');
  }
} 