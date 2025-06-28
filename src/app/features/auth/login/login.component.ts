import { Component, OnInit, inject, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { InputGroupModule } from 'primeng/inputgroup';
import { CheckboxModule } from 'primeng/checkbox';

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
    CheckboxModule
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  error: string | null = null;
  message = '';
  token: string | null = null;
  private authService = inject(AuthService);

  constructor(private fb: FormBuilder, private router: Router, private messageService: MessageService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get f() { return this.loginForm.controls; }

  ngOnInit(): void {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      google.accounts.id.initialize({
        client_id: '788632771940-ra18rrnebhm7co6at9vbg5ktir3kpglv.apps.googleusercontent.com',
        locale: 'en',
        callback: (resp: any) => {
          if (resp.credential) {
            this.authService.googleLogin(resp.credential).subscribe({
              next: (res: any) => {
                this.token = res.token?.accessToken || null;
                if (res.isAuthSuccessful) {
                  this.messageService.add({severity:'success', summary:'Google Login', detail:'Login successful!'});
                  this.router.navigate(['/admin']);
                } else {
                  this.messageService.add({severity:'error', summary:'Google Login', detail:'Google login failed.'});
                }
              },
              error: (err: any) => {
                this.messageService.add({severity:'error', summary:'Google Login', detail:'Google login failed: ' + (err.error?.title || err.statusText)});
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


  onSubmit() {
    this.submitted = true;
    this.error = null;
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.messageService.add({severity:'success', summary:'Login Successful', detail:'Welcome back!'});
        this.router.navigate(['/admin']);
      },
      error: (err: any) => {
        this.loading = false;
        console.log(err);
        const detail = (typeof err.error === 'string' ? err.error : err.error?.Message) || 'Login failed';
        if (detail === 'Email not confirmed') {
          this.messageService.add({
            severity: 'warn',
            summary: 'Email Not Confirmed',
            detail: 'Please check your inbox and confirm your email before logging in.'

          });
        } else {
          this.messageService.add({severity:'error', summary:'Login Failed', detail});
        }
      }
    });
  }
}
