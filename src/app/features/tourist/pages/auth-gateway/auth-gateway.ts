import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-auth-gateway',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './auth-gateway.html',
  styleUrl: './auth-gateway.scss',
})
export class AuthGateway {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  readonly isExistingUser = signal<boolean>(true);
  readonly verificationState = signal<'idle' | 'success' | 'failed'>('idle');
  readonly loginFailed = signal(false);

  readonly registerForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  setMode(existing: boolean): void {
    this.isExistingUser.set(existing);
    this.verificationState.set('idle');
    this.loginFailed.set(false);
  }

  submitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { fullName, email, phone, password } = this.registerForm.getRawValue();
    this.authService
      .registerTourist({ fullName, email, phone, password })
      .pipe(
        catchError(() => {
          this.verificationState.set('failed');
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response) => {
        if (!response) {
          return;
        }
        this.verificationState.set('success');
        this.isExistingUser.set(true);
        this.loginForm.patchValue({ email });
      });
  }

  submitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.authService
      .login({ email, password })
      .pipe(
        catchError(() => {
          this.loginFailed.set(true);
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((session) => {
        if (!session) {
          return;
        }
        this.loginFailed.set(false);
        void this.router.navigate(['/tourist/dashboard']);
      });
  }
}
