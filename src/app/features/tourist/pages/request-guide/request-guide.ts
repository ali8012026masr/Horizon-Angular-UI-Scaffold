import { Component, DestroyRef, signal, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { catchError, of } from 'rxjs';
import { GuideAvailabilityService } from '../../../../core/services/guide-availability';
import { GuideBookingService } from '../../../../core/services/guide-booking';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-request-guide',
  imports: [ReactiveFormsModule],
  templateUrl: './request-guide.html',
  styleUrl: './request-guide.scss',
})
export class RequestGuide {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly availabilityService = inject(GuideAvailabilityService);
  private readonly guideBookingService = inject(GuideBookingService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly guideId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly submitted = signal(false);
  readonly error = signal('');
  readonly form = this.fb.nonNullable.group({
    date: ['', Validators.required],
    note: ['', [Validators.required, Validators.minLength(10)]],
    proposedPrice: [3000, [Validators.required, Validators.min(500)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.guideId) {
      this.error.set('Guide is missing.');
      return;
    }

    const { date, proposedPrice } = this.form.getRawValue();

    this.availabilityService
      .listByGuide(this.guideId)
      .pipe(
        catchError(() => of([])),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((availabilities) => {
        const availability =
          availabilities.find((item) => item.status === 'OPEN' && item.date === date) ??
          availabilities.find((item) => item.date === date);
        if (!availability) {
          this.error.set('This guide has no availability on the selected date.');
          return;
        }

        this.guideBookingService
          .create({
            touristId: this.authService.currentUser().id,
            tourGuideId: this.guideId,
            guideAvailabilityId: availability.id,
            scheduleDate: date,
            agreedPrice: proposedPrice,
            isNegotiated: true,
          })
          .pipe(
            catchError((err) => {
              this.error.set(err?.message ?? 'Could not send request.');
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
      });
  }
}
