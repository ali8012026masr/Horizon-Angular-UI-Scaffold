import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { BookingService } from '../../../../core/services/booking';
import { ServiceSlotService } from '../../../../core/services/service-slot';
import { AuthService } from '../../../../core/services/auth';
import { BookingResponse } from '../../../../models/booking.model';
import { ApiError } from '../../../../models/api-error.model';

interface ConfirmedBookingRow extends BookingResponse {
  slotTitle: string;
}

@Component({
  selector: 'app-booking-confirmation',
  imports: [DatePipe, CurrencyPipe, RouterLink],
  templateUrl: './booking-confirmation.html',
  styleUrl: './booking-confirmation.scss',
})
export class BookingConfirmation {
  private readonly bookingService = inject(BookingService);
  private readonly slotService = inject(ServiceSlotService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly bookings = signal<ConfirmedBookingRow[]>([]);

  constructor() {
    this.bookingService
      .listByTourist(this.authService.currentUser().id)
      .pipe(
        switchMap((bookings) => {
          if (bookings.length === 0) {
            return of([]);
          }
          return forkJoin(
            bookings.map((booking) =>
              this.slotService.getById(booking.slotId).pipe(
                map((slot) => ({
                  ...booking,
                  slotTitle: slot.origin ? `${slot.origin} -> ${slot.destination}` : (slot.locationName ?? slot.providerName),
                })),
                catchError(() => of({ ...booking, slotTitle: 'Unknown service' }))
              )
            )
          );
        }),
        catchError((error: ApiError) => {
          this.error.set(error.message);
          return of([]);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((bookings) => {
        this.bookings.set(bookings);
        this.loading.set(false);
      });
  }
}
