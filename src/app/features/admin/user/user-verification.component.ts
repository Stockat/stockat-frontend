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
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserService } from '../../../core/services/user.service';
import { UserVerificationReadDto } from '../../../core/models/user-models/user-verification-read.dto';
import { UserVerificationStatusUpdateDto } from '../../../core/models/user-models/user-verification-status-update.dto';
import { PaginatedDto } from '../../../core/models/user-models/paginated-dto';
import { GenericResponseDto } from '../../../core/models/user-models/generic-response.dto';

@Component({
  selector: 'app-user-verification',
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
    TooltipModule
  ],
  templateUrl: './user-verification.component.html',
  styleUrls: ['./user-verification.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class UserVerificationComponent implements OnInit {
  verifications: UserVerificationReadDto[] = [];
  selectedVerification: UserVerificationReadDto | null = null;
  loading = false;
  totalVerifications = 0;
  currentPage = 1;
  pageSize = 5;
  
  // Dialog states
  showVerificationDetails = false;
  showStatusUpdateDialog = false;
  
  // Forms
  statusUpdateForm: FormGroup;
  
  // Statistics
  statistics = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    approvalRate: 0,
    rejectionRate: 0
  };

  verificationSearchTerm: string = '';
  verificationStatus: string = ''; // default to All
  statusOptions = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' }
  ];

  statusUpdateLoading = false;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.statusUpdateForm = this.fb.group({
      status: ['', Validators.required],
      note: ['']
    });
  }

  ngOnInit() {
    this.loadVerifications();
    this.loadStatistics();
  }

  loadVerifications() {
    this.loading = true;
    this.userService.getAllVerifications(this.currentPage, this.pageSize, this.verificationStatus, this.verificationSearchTerm).subscribe({
      next: (response: GenericResponseDto<PaginatedDto<UserVerificationReadDto[]>>) => {
        this.verifications = response.data.paginatedData;
        this.totalVerifications = response.data.count;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load verification requests'
        });
        this.loading = false;
      }
    });
  }

  loadStatistics() {
    this.userService.getVerificationStatistics().subscribe({
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
    this.loadVerifications();
  }

  viewVerificationDetails(verification: UserVerificationReadDto) {
    this.selectedVerification = verification;
    this.showVerificationDetails = true;
  }

  openStatusUpdateDialog(verification: UserVerificationReadDto) {
    this.selectedVerification = verification;
    this.statusUpdateForm.reset();
    this.statusUpdateForm.patchValue({
      status: 'Approved'
    });
    this.showStatusUpdateDialog = true;
  }

  submitStatusUpdate() {
    if (this.statusUpdateForm.valid && this.selectedVerification) {
      this.statusUpdateLoading = true;
      const statusData: UserVerificationStatusUpdateDto = {
        userId: this.selectedVerification.userId,
        status: this.statusUpdateForm.value.status,
        note: this.statusUpdateForm.value.note
      };

      this.userService.updateVerificationStatus(statusData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Verification ${statusData.status.toLowerCase()} successfully`
          });
          this.showStatusUpdateDialog = false;
          this.statusUpdateLoading = false;
          this.loadVerifications();
          this.loadStatistics();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update verification status'
          });
          this.statusUpdateLoading = false;
        }
      });
    }
  }

  isApprovedStatus(verification: UserVerificationReadDto): boolean {
    return verification.status === 'Approved';
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'danger';
      case 'Pending': return 'warning';
      default: return 'secondary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Approved': return 'pi pi-check-circle';
      case 'Rejected': return 'pi pi-times-circle';
      case 'Pending': return 'pi pi-clock';
      default: return 'pi pi-question-circle';
    }
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

  onVerificationSearchChange(term: string) {
    this.currentPage = 1;
    this.loadVerifications();
  }

  onStatusFilterChange(status: string) {
    this.verificationStatus = status;
    this.currentPage = 1;
    this.loadVerifications();
  }
} 