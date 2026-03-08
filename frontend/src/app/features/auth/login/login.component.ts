import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { RouterLink } from '@angular/router';
import { NgxCaptchaModule } from 'ngx-captcha';
import { RECAPTCHA_SITE_KEY } from '../../../core/constants/recaptcha.constants';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgxCaptchaModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  protected readonly siteKey = RECAPTCHA_SITE_KEY;
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  loading = signal(false);
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(5)]],
    recaptcha: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    const { email, password, recaptcha } = this.form.getRawValue();
    this.auth.login({ email, password, captchaToken: recaptcha }).subscribe({
      next: () => {
        const role = this.auth.currentRole();
        if (role === 'Admin') this.router.navigate(['/admin/users']);
        else if (role === 'Customer') this.router.navigate(['/customer/browse-plans']);
        else if (role === 'Agent') this.router.navigate(['/agent/assigned-policies']);
        else if (role === 'ClaimOfficer') this.router.navigate(['/claim-officer/assigned-claims']);
        else this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.message ?? err.message ?? 'Login failed');
      },
    });
  }
}
