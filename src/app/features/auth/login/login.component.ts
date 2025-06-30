import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { HttpClientModule } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { InputGroupModule } from 'primeng/inputgroup';
import { CheckboxModule } from 'primeng/checkbox';
import { UserService } from '../../../core/services/user.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    HttpClientModule,
    RouterModule,
    ToastModule,
    CardModule,
    InputGroupModule,
    CheckboxModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  error: string | null = null;
  message = '';
  token: string | null = null;

  private authService = inject(AuthService);
  private confirmationService = inject(ConfirmationService);
  private userService = inject(UserService);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  ngOnInit(): void {
    // Show deactivation toast if redirected from deactivation
    if (localStorage.getItem('showDeactivatedToast') === '1') {
      setTimeout(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Account Deactivated',
          detail: 'Your account has been deactivated.'
        });
        localStorage.removeItem('showDeactivatedToast');
      }, 100);
    }
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      google.accounts.id.initialize({
        client_id: '788632771940-ra18rrnebhm7co6at9vbg5ktir3kpglv.apps.googleusercontent.com',
        locale: 'en',
        callback: (resp: any) => {
          if (resp.credential) {
            this.authService.googleLogin(resp.credential).subscribe({
              next: (res: any) => {
                if (res.isDeleted) {
                  this.confirmationService.confirm({
                    message: 'Your account is deactivated. Do you want to reactivate it?',
                    header: 'Reactivate Account',
                    icon: 'pi pi-exclamation-triangle',
                    accept: () => {
                      this.authService.setTokens(res.token);
                      this.userService.toggleUserActivation().subscribe({
                        next: () => {
                          this.messageService.add({ severity: 'success', summary: 'Account Reactivated', detail: 'Welcome back!' });
                          this.router.navigate(['/admin']);
                        },
                        error: () => {
                          this.messageService.add({ severity: 'error', summary: 'Reactivation Failed', detail: 'Could not reactivate your account.' });
                        }
                      });
                    },
                    reject: () => {
                      this.messageService.add({
                        severity: 'info',
                        summary: 'Login Cancelled',
                        detail: 'You must reactivate your account to log in.'
                      });
                    }
                  });
                } else if (res.isAuthSuccessful) {
                  this.authService.setTokens(res.token);
                  this.messageService.add({ severity: 'success', summary: 'Google Login', detail: 'Login successful!' });
                  this.router.navigate(['/admin']);
                } else {
                  this.messageService.add({ severity: 'error', summary: 'Google Login', detail: 'Google login failed.' });
                }
              },
              error: (err: any) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Google Login',
                  detail: 'Google login failed: ' + (err.error?.title || err.statusText)
                });
              }
            });
          } else {
            this.message = 'No credential received from Google.';
          }
        }
      });

      const btn = document.getElementById('google-btn');
      if (btn) {
        google.accounts.id.renderButton(btn, {
          theme: 'filled_blue',
          size: 'large',
          shape: 'rectangular',
          width: btn.offsetWidth || 400,
          text: 'signin_with',
          logo_alignment: 'left',
          locale: 'en'
        });

        setTimeout(() => {
          const googleBtn = btn.querySelector('div');
          if (googleBtn) {
            googleBtn.classList.add('google-btn-custom');
          }
        }, 100);
      }
    } else {
      console.error('Google Identity Services SDK not loaded.');
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = null;

    if (this.loginForm.invalid) return;

    this.loading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.loading = false;

        if (res.isDeleted) {
          // Show reactivation confirmation
          this.confirmationService.confirm({
            message: 'Your account is deactivated. Do you want to reactivate it?',
            header: 'Reactivate Account',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
              this.authService.setTokens(res.token);

              this.userService.toggleUserActivation().subscribe({
                next: () => {
                  this.messageService.add({ severity: 'success', summary: 'Account Reactivated', detail: 'Welcome back!' });
                  this.router.navigate(['/admin']);
                },
                error: () => {
                  this.messageService.add({ severity: 'error', summary: 'Reactivation Failed', detail: 'Could not reactivate your account.' });
                }
              });
            },
            reject: () => {
              this.messageService.add({
                severity: 'info',
                summary: 'Login Cancelled',
                detail: 'You must reactivate your account to log in.'
              });
            }
          });
        } else {
          this.authService.setTokens(res.token);
          this.messageService.add({ severity: 'success', summary: 'Login Successful', detail: 'Welcome back!' });
          this.router.navigate(['/admin']);
        }
      },
      error: (err: any) => {
        this.loading = false;
        const detail = (typeof err.error === 'string' ? err.error : err.error?.message) || 'Wrong email or password';

        if (detail === 'Email not confirmed') {
          this.messageService.add({
            severity: 'warn',
            summary: 'Email Not Confirmed',
            detail: 'Please check your inbox and confirm your email before logging in.'
          });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Login Failed', detail });
        }
      }
    });
  }
}
