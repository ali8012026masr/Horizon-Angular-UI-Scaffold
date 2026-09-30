import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-apply-guide',
  imports: [ReactiveFormsModule],
  templateUrl: './apply.html',
  styleUrl: './apply.scss',
})
export class ApplyGuide {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  readonly submitted = signal(false);
  readonly error = signal('');
  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
    nationalId: ['', [Validators.required, Validators.pattern(/^[0-9]{10,17}$/)]],
    location: ['', [Validators.required, Validators.minLength(2)]],
    address: ['', [Validators.required, Validators.minLength(5)]],
    languages: ['', [Validators.required, Validators.minLength(2)]],
    experience: ['', [Validators.required, Validators.minLength(10)]],
    experienceYears: [null, [Validators.required, Validators.min(0)]],
    price: [null, [Validators.required, Validators.min(100)]],
    negotiable: [false],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { fullName, email, password, phone, nationalId, location, address, languages, experience, experienceYears, price, negotiable } =
      this.form.getRawValue();
    const languagesArray = languages ? languages.split(',').map((s) => s.trim()).filter(Boolean) : undefined;
    this.authService
      .registerGuide({
        fullName,
        email,
        password,
        phone,
        address,
        nationalId,
        location,
        bio: experience,
        languages: languagesArray,
        experienceYears: experienceYears ?? 0,
        defaultPrice: price ?? undefined,
        negotiable,
      })
      .pipe(
        catchError((err) => {
          this.error.set(err?.message ?? 'Application failed.');
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
