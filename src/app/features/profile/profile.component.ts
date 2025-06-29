import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserService, UserReadDto, UserUpdateDto, ChangePasswordDto } from '../../core/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ButtonModule, InputTextModule, ReactiveFormsModule, ToastModule, ConfirmDialogModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class ProfileComponent implements OnInit {
  activeTab: string = 'about';
  user: UserReadDto | null = null;
  loading = false;
  error: string | null = null;
  editForm: FormGroup;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.editForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      address: [''],
      city: [''],
      country: [''],
      postalCode: [''],
      aboutMe: ['']
    });
  }

  ngOnInit() {
    this.fetchUser();
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  fetchUser() {
    this.loading = true;
    this.userService.getCurrentUser().subscribe({
      next: (res) => {
        this.user = res.data;
        if (this.user) {
          this.editForm.patchValue(this.user);
        }
        console.log('User data loaded:', this.user);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load user data.';
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Load Failed',
          detail: 'Failed to load user data.'
        });
      }
    });
  }

  onEditSubmit() {
    if (this.editForm.valid) {
      this.confirmationService.confirm({
        message: 'Are you sure you want to update your profile?',
        header: 'Confirm Update',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.updateUser(this.editForm.value);
        }
      });
    }
  }

  updateUser(dto: UserUpdateDto) {
    this.loading = true;
    this.userService.updateUser(dto).subscribe({
      next: (res) => {
        this.user = res.data;
        if (this.user) {
          this.editForm.patchValue(this.user);
        }
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Profile Updated',
          detail: 'Your profile has been updated successfully.'
        });
      },
      error: (err) => {
        this.error = 'Failed to update user.';
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Update Failed',
          detail: 'Failed to update your profile.'
        });
      }
    });
  }

  updateProfileImage(file: File) {
    this.loading = true;
    this.userService.updateProfileImage(file).subscribe({
      next: (res) => {
        this.user = res.data;
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Image Updated',
          detail: 'Profile image updated successfully.'
        });
      },
      error: (err) => {
        this.error = 'Failed to update profile image.';
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Image Update Failed',
          detail: 'Failed to update profile image.'
        });
      }
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
          detail: 'Your password has been changed successfully.'
        });
      },
      error: (err) => {
        this.error = 'Failed to change password.';
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Password Change Failed',
          detail: 'Failed to change password.'
        });
      }
    });
  }
}
