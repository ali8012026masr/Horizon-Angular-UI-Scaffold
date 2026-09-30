import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth';
import { SERVICE_CATEGORIES, ServiceCategory } from '../../../../models/service-slot.model';

@Component({
  selector: 'app-register-business',
  imports: [ReactiveFormsModule],
  templateUrl: './register-business.html',
  styleUrl: './register-business.scss',
})
export class RegisterBusiness {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  readonly categories = SERVICE_CATEGORIES;
  readonly submitted = signal(false);
  readonly error = signal('');
  readonly form = this.fb.nonNullable.group({
    ownerName: ['', [Validators.required, Validators.minLength(3)]],
    businessName: ['', [Validators.required, Validators.minLength(3)]],
    ownerEmail: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    category: ['', Validators.required],
    commissionRate: [10, [Validators.min(0), Validators.max(100)]],
    tradeLicense: ['', Validators.required],
    nationalId: ['', [Validators.required, Validators.pattern(/^[0-9]{10,17}$/)]],
    phone: ['', Validators.required],
    address: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { ownerName, businessName, ownerEmail, password, category, tradeLicense, nationalId, phone, address, commissionRate } = this.form.getRawValue();
    this.authService
      .registerProvider({
        fullName: ownerName,
        email: ownerEmail,
        password,
        businessName,
        tradeLicenseNo: tradeLicense,
        nationalId,
        category: category as ServiceCategory,
        phone,
        address,
        commissionRate: commissionRate as number,
      })
      .pipe(
        catchError((err) => {
          this.error.set(err?.message ?? 'Registration failed.');
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response) => {
        if (!response) {
          return;
        }
        this.error.set('');
        this.submitted.set(true);
      });
  }
}
