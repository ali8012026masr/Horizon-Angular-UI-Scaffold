import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { BookingService } from '../../../../core/services/booking';
import { ServiceSlotService } from '../../../../core/services/service-slot';
import { AuthService } from '../../../../core/services/auth';
import { BookingResponse } from '../../../../models/booking.model';
import { ServiceCategory, serviceCategoryLabel } from '../../../../models/service-slot.model';
import { ApiError } from '../../../../models/api-error.model';

interface ProviderBookingRow extends BookingResponse {
  category: ServiceCategory | null;
  slot: string;
}

@Component({
  selector: 'app-bookings-list',
  imports: [RouterLink],
  templateUrl: './bookings-list.html',
  styleUrl: './bookings-list.scss',
})
export class BookingsList {
  private readonly bookingService = inject(BookingService);
  private readonly slotService = inject(ServiceSlotService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly categoryLabel = serviceCategoryLabel;
  readonly loading = signal(true);
  readonly error = signal('');
  readonly rows = signal<ProviderBookingRow[]>([]);

  constructor() {
    this.bookingService
      .listByProvider(this.authService.currentUser().id)
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
                  category: slot.category,
                  slot: slot.origin ? `${slot.origin} -> ${slot.destination}` : (slot.locationName ?? slot.providerName),
                })),
                catchError(() => of({ ...booking, category: null, slot: 'Unknown slot' }))
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
      .subscribe((rows) => {
        this.rows.set(rows);
        this.loading.set(false);
      });
  }
}
