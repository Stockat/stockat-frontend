import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
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
  editMode = false;
  originalUser: UserReadDto | null = null;
  changePasswordForm: FormGroup;
  verification: UserVerificationReadDto | null = null;
  verificationLoading = false;
  deactivateLoading = false;
  verifyForm: FormGroup;
  changePasswordLoading = false;
  submitted = false;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService
  ) {
    this.editForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      address: [''],
      city: [''],
      country: [''],
      postalCode: [''],
      aboutMe: ['']
    });
    this.editForm.disable();
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.verifyForm = this.fb.group({
      nationalId: ['', [Validators.required, Validators.pattern(/^[2-3]\d{13}$/)]],
      image: [null],
      imagePreview: ['']
    });
  }

  ngOnInit() {
    this.fetchUser();
    this.fetchUserVerification();
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    if (tab !== 'edit') {
      this.editMode = false;
      this.editForm.disable();
    }
    if (tab === 'verify') {
      this.fetchUserVerification();
    }
  }

  fetchUser() {
    this.loading = true;
    this.userService.getCurrentUser().subscribe({
      next: (res) => {
        this.user = res.data;
        if (this.user) {
          this.editForm.patchValue(this.user);
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
          detail: 'Failed to load user data.'
        });
      }
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
            imagePreview: ''
          });
        } else {
          this.verifyForm.reset();
        }
      },
      error: (err) => {
        this.verification = null;
        // this.verificationLoading = false;
        this.verifyForm.reset();
      }
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
        this.editForm.disable();
        this.editMode = false;
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
        console.log('Profile image updated:', res);
        if (this.user) {
            this.user.profileImageUrl = res.data;
        }
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid File',
          detail: 'Please select an image file.'
        });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: 'File Too Large',
          detail: 'Please select an image smaller than 5MB.'
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
        }
      });
    }
  }

  onChangePasswordSubmit() {
    if (this.changePasswordForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Input',
        detail: 'Please fill in both fields. New password must be at least 6 characters.'
      });
      return;
    }
    const dto = {
      currentPassword: this.changePasswordForm.value.currentPassword,
      newPassword: this.changePasswordForm.value.newPassword
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
              detail: 'Your password has been changed successfully.'
            });
            this.changePasswordForm.reset();
            this.changePasswordLoading = false;
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Change Failed',
              detail: err?.error?.message || 'Failed to change password.'
            });
            this.changePasswordLoading = false;
          }
        });
      },
      reject: () => {
        this.changePasswordLoading = false;
      }
    });
  }

  createUserVerification(form: FormGroup) {
    this.submitted = true;
    if (form.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Invalid Input', detail: 'Please fill in all fields and upload an image.' });
      return;
    }
    const dto: UserVerificationCreateDto = {
      nationalId: form.value.nationalId,
      image: form.value.image
    };
    this.confirmationService.confirm({
      message: 'Are you sure you want to submit your verification documents?',
      header: 'Confirm Verification',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.verificationLoading = true;
        this.userService.createUserVerification(dto).subscribe({
          next: (res) => {
            this.messageService.add({ severity: 'success', summary: 'Submitted', detail: 'Verification submitted successfully.' });
            this.fetchUserVerification();
            form.reset();
            this.verificationLoading = false;
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Failed', detail: err?.error?.message || 'Failed to submit verification.' });
            this.verificationLoading = false;
          }
        });
      }
    });
  }

  updateUserVerification(form: FormGroup) {
    if (form.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Invalid Input', detail: 'Please fill in all fields.' });
      return;
    }
    const dto: UserVerificationUpdateDto = {
      nationalId: form.value.nationalId,
      image: form.value.image
    };
    this.confirmationService.confirm({
      message: 'Are you sure you want to update your verification documents?',
      header: 'Confirm Update',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.verificationLoading = true;
        this.userService.updateUserVerification(dto).subscribe({
          next: (res) => {
            this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Verification updated successfully.' });
            this.fetchUserVerification();
            form.reset();
            this.verificationLoading = false;
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Failed', detail: err?.error?.message || 'Failed to update verification.' });
            this.verificationLoading = false;
          }
        });
      }
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
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Verification entry deleted.' });
            this.fetchUserVerification();
            this.verificationLoading = false;
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Failed', detail: err?.error?.message || 'Failed to delete verification.' });
            this.verificationLoading = false;
          }
        });
      }
    });
  }

  deactivateUser() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to deactivate your account? This action cannot be undone.',
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
            this.messageService.add({ severity: 'error', summary: 'Failed', detail: err?.error?.message || 'Failed to deactivate account.' });
            this.deactivateLoading = false;
          }
        });
      }
    });
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
}
