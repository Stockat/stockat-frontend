import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
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
import { PunishmentReadDto } from '../../../core/models/user-models/punishment-read.dto';
import { CreatePunishmentDto } from '../../../core/models/user-models/create-punishment.dto';
import { PaginatedDto } from '../../../core/models/user-models/paginated-dto';
import { GenericResponseDto } from '../../../core/models/user-models/generic-response.dto';

@Component({
  selector: 'app-user-punishment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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
  templateUrl: './user-punishment.component.html',
  styleUrls: ['./user-punishment.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class UserPunishmentComponent implements OnInit {
  punishments: PunishmentReadDto[] = [];
  selectedPunishment: PunishmentReadDto | null = null;
  loading = false;
  totalPunishments = 0;
  currentPage = 1;
  pageSize = 10;
  
  // Dialog states
  showPunishmentDetails = false;
  showCreatePunishmentDialog = false;
  createPunishmentLoading = false;
  
  // Forms
  createPunishmentForm: FormGroup;
  
  // Filters
  typeFilter: string = '';
  statusFilter: string = '';
  
  // Statistics
  statistics = {
    total: 0,
    warnings: 0,
    temporaryBans: 0,
    permanentBans: 0,
    activeBans: 0,
    warningPercentage: 0,
    banPercentage: 0
  };

  // Punishment types
  punishmentTypes = [
    { label: 'Warning', value: 'Warning' },
    { label: 'Temporary Ban', value: 'TemporaryBan' },
    { label: 'Permanent Ban', value: 'PermanentBan' }
  ];

  punishmentSearchTerm: string = '';

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.createPunishmentForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      type: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]],
      endDate: [null]
    });
  }

  ngOnInit() {
    this.loadPunishments();
    this.loadStatistics();
  }

  loadPunishments() {
    this.loading = true;
    
    this.userService.getAllPunishments(this.currentPage, this.pageSize, this.punishmentSearchTerm).subscribe({
      next: (response: GenericResponseDto<PunishmentReadDto[]>) => {
        this.punishments = response.data;
        this.totalPunishments = this.punishments.length; // This should come from pagination
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load punishments'
        });
        this.loading = false;
      }
    });
  }

  loadActivePunishments() {
    this.loading = true;
    
    this.userService.getActivePunishments(this.currentPage, this.pageSize).subscribe({
      next: (response: GenericResponseDto<PaginatedDto<PunishmentReadDto[]>>) => {
        this.punishments = response.data.paginatedData;
        this.totalPunishments = response.data.count;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load active punishments'
        });
        this.loading = false;
      }
    });
  }

  loadPunishmentsByType(type: string) {
    this.loading = true;
    
    this.userService.getPunishmentsByType(type, this.currentPage, this.pageSize).subscribe({
      next: (response: GenericResponseDto<PaginatedDto<PunishmentReadDto[]>>) => {
        this.punishments = response.data.paginatedData;
        this.totalPunishments = response.data.count;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load punishments by type'
        });
        this.loading = false;
      }
    });
  }

  loadStatistics() {
    this.userService.getPunishmentStatistics().subscribe({
      next: (response: GenericResponseDto<any>) => {
        this.statistics = response.data;
      },
      error: (error) => {
        console.error('Failed to load statistics:', error);
      }
    });
  }

  onPageChange(event: any) {
    this.currentPage = event.page + 1;
    this.pageSize = event.rows;
    this.loadPunishments();
  }

  onFilterChange() {
    this.currentPage = 1;
    if (this.statusFilter === 'active') {
      this.loadActivePunishments();
    } else if (this.typeFilter) {
      this.loadPunishmentsByType(this.typeFilter);
    } else {
      this.loadPunishments();
    }
  }

  viewPunishmentDetails(punishment: PunishmentReadDto) {
    this.selectedPunishment = punishment;
    this.showPunishmentDetails = true;
  }

  openCreatePunishmentDialog() {
    this.createPunishmentForm.reset();
    this.showCreatePunishmentDialog = true;
  }

  submitPunishment() {
    if (this.createPunishmentForm.valid) {
      this.createPunishmentLoading = true;
      const punishmentData: CreatePunishmentDto = {
        email: this.createPunishmentForm.value.email,
        type: this.createPunishmentForm.value.type,
        reason: this.createPunishmentForm.value.reason,
        endDate: this.createPunishmentForm.value.endDate
      };

      this.userService.createPunishment(punishmentData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Punishment created successfully'
          });
          this.showCreatePunishmentDialog = false;
          this.createPunishmentLoading = false;
          this.loadPunishments();
          this.loadStatistics();
        },
        error: (error) => {
          let detail = 'Failed to create punishment';
          console.log(error.error.Message);
          if (error?.error?.Message) {
            detail = error.error.Message;
          } else if (typeof error?.error === 'string') {
            detail = error.error;
          } else if (error?.error?.errors) {
            detail = Object.values(error.error.errors).flat().join(' ');
          }
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail
          });
          this.createPunishmentLoading = false;
        }
      });
    } else {
      // Show frontend validation errors in toast
      const controls = this.createPunishmentForm.controls;
      if (controls['email'].errors) {
        if (controls['email'].errors['required']) {
          this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Email is required.' });
        } else if (controls['email'].errors['email']) {
          this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Email must be a valid email address.' });
        }
      }
      if (controls['type'].errors) {
        this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Punishment type is required.' });
      }
      if (controls['reason'].errors) {
        if (controls['reason'].errors['required']) {
          this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Reason is required.' });
        } else if (controls['reason'].errors['minlength']) {
          this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Reason must be at least 10 characters long.' });
        }
      }
      if (controls['endDate'].errors) {
        this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'End date is required for temporary bans.' });
      }
    }
  }

  removePunishment(punishment: PunishmentReadDto) {
    this.confirmationService.confirm({
      message: `Are you sure you want to remove this ${punishment.type.toLowerCase()}?`,
      header: 'Confirm Removal',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.removePunishment(punishment.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Punishment removed successfully'
            });
            this.loadPunishments();
            this.loadStatistics();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to remove punishment'
            });
          }
        });
      }
    });
  }

  getPunishmentSeverity(type: string): string {
    switch (type) {
      case 'Warning': return 'warning';
      case 'TemporaryBan': return 'danger';
      case 'PermanentBan': return 'danger';
      default: return 'secondary';
    }
  }

  getPunishmentIcon(type: string): string {
    switch (type) {
      case 'Warning': return 'pi pi-exclamation-triangle';
      case 'TemporaryBan': return 'pi pi-clock';
      case 'PermanentBan': return 'pi pi-ban';
      default: return 'pi pi-question-circle';
    }
  }

  isPunishmentActive(punishment: PunishmentReadDto): boolean {
    if (punishment.type === 'Warning') return false;
    if (punishment.type === 'PermanentBan') return true;
    if (punishment.type === 'TemporaryBan' && punishment.endDate) {
      return new Date(punishment.endDate) > new Date();
    }
    return false;
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onPunishmentTypeChange() {
    const type = this.createPunishmentForm.get('type')?.value;
    const endDateControl = this.createPunishmentForm.get('endDate');
    
    if (type === 'TemporaryBan') {
      endDateControl?.setValidators([Validators.required]);
    } else {
      endDateControl?.clearValidators();
      endDateControl?.setValue(null);
    }
    
    endDateControl?.updateValueAndValidity();
  }

  getCurrentDate(): Date {
    return new Date();
  }

  onPunishmentSearchChange(term: string) {
    this.currentPage = 1;
    this.loadPunishments();
  }
} 