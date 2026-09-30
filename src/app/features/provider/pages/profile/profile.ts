import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth';
import { ProviderService } from '../../../../core/services/provider';
import { ApiError } from '../../../../models/api-error.model';
import { ProviderResponse } from '../../../../models/provider.model';
import { SERVICE_CATEGORIES, ServiceCategory } from '../../../../models/service-slot.model';

@Component({
  selector: 'app-provider-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private readonly fb = inject(FormBuilder);
  private readonly providerService = inject(ProviderService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly categories = SERVICE_CATEGORIES;
  readonly loading = signal(true);
  readonly error = signal('');
  readonly success = signal('');
  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly profile = signal<ProviderResponse | null>(null);

  readonly form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    phone: [''],
    address: [''],
    businessName: ['', Validators.required],
    tradeLicenseNo: [''],
    category: ['' as ServiceCategory, Validators.required],
    commissionRate: [0, [Validators.min(0), Validators.max(100)]],
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
    this.providerService
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
        this.applyToForm(profile);
      });
  }

  private applyToForm(profile: ProviderResponse): void {
    this.profile.set(profile);
    this.form.reset({
      fullName: profile.fullName,
      phone: profile.phone ?? '',
      address: profile.address ?? '',
      businessName: profile.businessName,
      tradeLicenseNo: profile.tradeLicenseNo ?? '',
      category: profile.category as ServiceCategory,
      commissionRate: profile.commissionRate,
    });
  }

  startEdit(): void {
    this.editing.set(true);
    this.success.set('');
  }

  cancelEdit(): void {
    const profile = this.profile();
    if (profile) {
      this.applyToForm(profile);
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

    this.providerService
      .update(this.authService.currentUser().id, {
        fullName: raw.fullName,
        phone: raw.phone || undefined,
        address: raw.address || undefined,
        businessName: raw.businessName,
        tradeLicenseNo: raw.tradeLicenseNo || undefined,
        category: raw.category,
        commissionRate: raw.commissionRate,
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
        this.applyToForm(profile);
        this.editing.set(false);
        this.success.set('Profile updated successfully.');
      });
  }

  deleteAccount(): void {
    if (!window.confirm('Delete your provider account? This cannot be undone.')) {
      return;
    }

    this.deleting.set(true);
    this.error.set('');
    this.providerService
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
        void this.router.navigate(['/provider/login'], {
          queryParams: { message: 'Password changed. Please log in again.' },
        });
      });
  }
}
