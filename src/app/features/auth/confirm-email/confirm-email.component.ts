import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.css']
})
export class ConfirmEmailComponent implements OnInit {
  message: string | null = null;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService) {}

  ngOnInit() {
    const userId = this.route.snapshot.queryParamMap.get('userId') || '';
    const token = this.route.snapshot.queryParamMap.get('token') || '';
    if (userId && token) {
      this.authService.confirmEmail(userId, token).subscribe({
        next: () => {
          this.message = 'Email confirmed successfully. You can now log in.';
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Failed to confirm email.';
        }
      });
    } else {
      this.error = 'Invalid confirmation link.';
    }
  }
}