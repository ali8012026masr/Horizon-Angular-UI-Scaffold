import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { UserSession } from '../../../models/user-session.model';
import { ApiError } from '../../../models/api-error.model';

const ROLE_ENTRY_ROUTE: Record<UserSession['role'], string> = {
  tourist: '/tourist/dashboard',
  provider: '/provider/dashboard',
  guide: '/guide/dashboard',
  admin: '/admin/dashboard',
};

interface DemoAccount extends UserSession {
  password: string;
  entryRoute: string;
  label: string;
}

@Component({
  selector: 'app-auth-shell',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './auth-shell.html',
  styleUrl: './auth-shell.scss',
})
export class AuthShell {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly invalid = signal(false);
  readonly loading = signal(false);
  readonly showRegister = signal(false);
  readonly registerSuccess = signal(false);
  readonly registerError = signal('');
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly registerForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly demoAccounts: DemoAccount[] = [
    {
      id: 'u-1001',
      name: 'Mohammad Ali',
      email: 'tourist@horizon.demo',
      role: 'tourist',
      verified: true,
      password: 'demo1234',
      entryRoute: '/tourist/dashboard',
      label: 'Tourist',
    },
    {
      id: 'u-2001',
      name: 'Asif Rahman',
      email: 'provider@horizon.demo',
      role: 'provider',
      verified: true,
      password: 'demo1234',
      entryRoute: '/provider/dashboard',
      label: 'Service Provider',
    },
    {
      id: 'u-3001',
      name: 'Zamal Uddin',
      email: 'guide@horizon.demo',
      role: 'guide',
      verified: true,
      password: 'demo1234',
      entryRoute: '/guide/dashboard',
      label: 'Tour Guide',
    },
    {
      id: 'u-4001',
      name: 'System Admin',
      email: 'admin@horizon.demo',
      role: 'admin',
      verified: true,
      password: 'demo1234',
      entryRoute: '/admin/dashboard',
      label: 'System Admin',
    },
  ];

  login(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.invalid.set(false);
    this.loading.set(true);

    this.authService
      .login({ email, password })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (session) => {
          this.loading.set(false);
          void this.router.navigateByUrl(ROLE_ENTRY_ROUTE[session.role]);
        },
        error: (error: ApiError) => {
          this.loading.set(false);
          this.invalid.set(true);
        },
      });
  }

  toggleRegister(show: boolean): void {
    this.showRegister.set(show);
    this.registerSuccess.set(false);
  }

  register(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.registerForm.getRawValue();
    this.registerError.set('');
    this.loading.set(true);

    this.authService
      .registerTourist({ fullName: name, email, password })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.registerSuccess.set(true);
          this.registerForm.reset();
          this.form.patchValue({ email, password });
          this.showRegister.set(false);
        },
        error: (error: ApiError) => {
          this.loading.set(false);
          this.registerError.set(error.message || 'Registration failed. Please try again.');
        },
      });
  }

  loginAsDemo(account: DemoAccount): void {
    this.form.patchValue({ email: account.email, password: account.password });
    this.invalid.set(false);
    this.loading.set(true);

    this.authService
      .login({ email: account.email, password: account.password })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (session) => {
          this.loading.set(false);
          void this.router.navigateByUrl(ROLE_ENTRY_ROUTE[session.role]);
        },
        error: () => {
          this.loading.set(false);
          this.invalid.set(true);
        },
      });
  }
}
