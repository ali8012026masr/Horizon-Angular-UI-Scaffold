import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { BookingService } from '../../../../core/services/booking';
import { ServiceSlotService } from '../../../../core/services/service-slot';
import { RatingService } from '../../../../core/services/rating';
import { AuthService } from '../../../../core/services/auth';

interface RatableBooking {
  bookingId: string;
  providerId: string;
  label: string;
}

@Component({
  selector: 'app-rate-services',
  imports: [ReactiveFormsModule],
  templateUrl: './rate-services.html',
  styleUrl: './rate-services.scss',
})
export class RateServices {
  private readonly fb = inject(FormBuilder);
  private readonly bookingService = inject(BookingService);
  private readonly slotService = inject(ServiceSlotService);
  private readonly ratingService = inject(RatingService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly submitted = signal(false);
  readonly ratableBookings = signal<RatableBooking[]>([]);

  readonly form = this.fb.nonNullable.group({
    bookingId: ['', Validators.required],
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor() {
    this.bookingService
      .listByTourist(this.authService.currentUser().id)
      .pipe(
        map((bookings) => bookings.filter((booking) => booking.status === 'COMPLETED')),
        switchMap((bookings) => {
          if (bookings.length === 0) {
            return of([]);
          }
          return forkJoin(
            bookings.map((booking) =>
              this.slotService.getById(booking.slotId).pipe(
                map((slot) => ({
                  bookingId: booking.id,
                  providerId: slot.providerId,
                  label: slot.origin ? `${slot.origin} -> ${slot.destination}` : (slot.locationName ?? slot.providerName),
                })),
                catchError(() => of(null))
              )
            )
          );
        }),
        map((rows) => rows.filter((row): row is RatableBooking => row !== null)),
        catchError(() => {
          this.error.set('Could not load your completed bookings.');
          return of([]);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((rows) => {
        this.ratableBookings.set(rows);
        this.loading.set(false);
      });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { bookingId, rating, comment } = this.form.getRawValue();
    const booking = this.ratableBookings().find((row) => row.bookingId === bookingId);
    if (!booking) {
      this.error.set('Select a completed booking to rate.');
      return;
    }

    this.ratingService
      .rateService({
        bookingId: booking.bookingId,
        touristId: this.authService.currentUser().id,
        providerId: booking.providerId,
        score: rating,
        comment,
      })
      .pipe(
        catchError((err) => {
          this.error.set(err?.message ?? 'Could not submit rating.');
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
