import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, HttpClientModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  loading = false;
  submitted = false;
  message: string | null = null;
  error: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() { return this.forgotForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.error = null;
    this.message = null;
    if (this.forgotForm.invalid) return;
    this.loading = true;
    this.authService.forgotPassword(this.forgotForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'Password reset link sent to your email.';
      },
      error: (err: any) => {
        this.loading = false;
        this.error = (typeof err.error === 'string' ? err.error : err.error?.message) || 'Failed to send reset link.';
      }
    });
  }
}