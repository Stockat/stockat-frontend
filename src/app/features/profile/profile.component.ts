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
  editMode = false;
  originalUser: UserReadDto | null = null;

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
    this.editForm.disable();
  }

  ngOnInit() {
    this.fetchUser();
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    if (tab !== 'edit') {
      this.editMode = false;
      this.editForm.disable();
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
}
