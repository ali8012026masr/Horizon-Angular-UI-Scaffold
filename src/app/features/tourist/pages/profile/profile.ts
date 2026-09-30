import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth';
import { TouristService } from '../../../../core/services/tourist';
import { ApiError } from '../../../../models/api-error.model';
import { TouristResponse } from '../../../../models/tourist.model';

@Component({
  selector: 'app-tourist-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private readonly fb = inject(FormBuilder);
  private readonly touristService = inject(TouristService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly success = signal('');
  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly profile = signal<TouristResponse | null>(null);

  readonly form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    phone: [''],
    address: [''],
  });

  readonly changingPassword = signal(false);
  readonly passwordError = signal('');
  readonly passwordSuccess = signal('');
  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.loading.set(true);
    this.error.set('');
    this.touristService
      .getById(this.authService.currentUser().id)
      .pipe(
        catchError((error: ApiError) => {
          this.error.set(error.message || 'Unable to load profile.');
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((profile) => {
        this.loading.set(false);
        if (!profile) {
          return;
        }
        this.profile.set(profile);
        this.form.reset({
          fullName: profile.fullName,
          phone: profile.phone ?? '',
          address: profile.address ?? '',
        });
      });
  }

  startEdit(): void {
    this.editing.set(true);
    this.success.set('');
  }

  cancelEdit(): void {
    const profile = this.profile();
    if (profile) {
      this.form.reset({
        fullName: profile.fullName,
        phone: profile.phone ?? '',
        address: profile.address ?? '',
      });
    }
    this.editing.set(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set('');
    const raw = this.form.getRawValue();

    this.touristService
      .update(this.authService.currentUser().id, {
        fullName: raw.fullName,
        phone: raw.phone || undefined,
        address: raw.address || undefined,
      })
      .pipe(
        catchError((error: ApiError) => {
          this.error.set(error.message || 'Unable to update profile.');
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((profile) => {
        this.saving.set(false);
        if (!profile) {
          return;
        }
        this.profile.set(profile);
        this.editing.set(false);
        this.success.set('Profile updated successfully.');
      });
  }

  deleteAccount(): void {
    if (!window.confirm('Delete your account? This cannot be undone.')) {
      return;
    }

    this.deleting.set(true);
    this.error.set('');
    this.touristService
      .delete(this.authService.currentUser().id)
      .pipe(
        catchError((error: ApiError) => {
          this.error.set(error.message || 'Unable to delete account.');
          this.deleting.set(false);
          return of('error' as const);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response) => {
        if (response === 'error') {
          return;
        }
        this.authService.clearSession();
        void this.router.navigate(['/']);
      });
  }

  changePassword(): void {
    this.passwordError.set('');
    this.passwordSuccess.set('');

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.passwordError.set('New password and confirmation do not match.');
      return;
    }

    this.changingPassword.set(true);
    this.authService
      .changePassword({ currentPassword, newPassword })
      .pipe(
        catchError((error: ApiError) => {
          this.passwordError.set(error.message || 'Unable to change password.');
          this.changingPassword.set(false);
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response) => {
        if (!response) {
          return;
        }
        this.changingPassword.set(false);
        this.authService.clearSession();
        void this.router.navigate(['/tourist/auth'], {
          queryParams: { message: 'Password changed. Please log in again.' },
        });
      });
  }
}
