import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { HttpClientModule } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { InputGroupModule } from 'primeng/inputgroup';
import { CheckboxModule } from 'primeng/checkbox';
import { RouterModule } from '@angular/router';
declare const google: any;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    HttpClientModule,
    ToastModule,
    CardModule,
    InputGroupModule,
    CheckboxModule,
    RouterModule
  ],
  providers: [MessageService],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  error: string | null = null;
  message = '';
  token: string | null = null;

  constructor(private fb: FormBuilder, public authService: AuthService, private router: Router, private messageService: MessageService) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
    
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
  
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      if (form.get('confirmPassword')?.hasError('mismatch')) {
        form.get('confirmPassword')?.setErrors(null);
      }
      return null;
    }
  }
  

  get f() {
    return this.registerForm.controls;
  }
  

  onSubmit() {
    this.submitted = true;
    this.error = null;
  
    if (this.registerForm.invalid) {
      const firstInvalid = document.querySelector('.ng-invalid');
      if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
  
    this.loading = true;
  
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.loading = false;
        localStorage.setItem('showRegistrationSuccessToast', '1');
        this.router.navigate(['/login']);
      },
   
      error: (err: any) => {
        this.loading = false;
        console.error('Registration error:', err);

        if (err.status === 400 && err.error) {
          const validationErrors = err.error;
          if (validationErrors.DuplicateEmail) {
            const control = this.registerForm.get('email');
            if (control) {
              control.setErrors({ server: validationErrors.DuplicateEmail[0] });
            }
          }
          // Handle other errors if present
          for (const key in validationErrors) {
            if (key !== 'DuplicateEmail' && validationErrors.hasOwnProperty(key)) {
              const controlName = key.charAt(0).toLowerCase() + key.slice(1);
              const control = this.registerForm.get(controlName);
              if (control) {
                control.setErrors({ server: validationErrors[key][0] });
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Validation Error',
                  detail: validationErrors[key][0]
                });
              }
            }
          }
        } else {
          const message = typeof err.error === 'string'
            ? err.error
            : err.error?.message || 'Registration failed';
          this.messageService.add({ severity: 'error', summary: 'Registration Failed', detail: message });
        }
      }
    });
  }
  

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
                  this.messageService.add({severity:'success', summary:'Google Registration', detail:'Registration successful!'});
                  this.router.navigate(['/admin']);
                } else {
                  this.messageService.add({severity:'error', summary:'Google Registration', detail:'Google registration failed.'});
                }
              },
              error: (err: any) => {
                this.messageService.add({severity:'error', summary:'Google Registration', detail:'Google registration failed: ' + (err.error?.title || err.statusText)});
              }
            });
          } else {
            this.message = 'No credential received from Google.';
          }
        }
      });
      const btn = document.getElementById('google-btn-register');
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
}
