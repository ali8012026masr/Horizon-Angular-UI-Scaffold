import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { AuthService } from '../../../../core/services/auth';
import { BookingService } from '../../../../core/services/booking';
import { ServiceSlotService } from '../../../../core/services/service-slot';
import { ApiError } from '../../../../models/api-error.model';
import { BookingResponse, BookingStatus } from '../../../../models/booking.model';
import { serviceCategoryLabel } from '../../../../models/service-slot.model';

interface ProviderBookingStatusRow extends BookingResponse {
  slotTitle: string;
  categoryLabel: string;
  startAt: string;
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

@Component({
  selector: 'app-update-booking-status',
  imports: [FormsModule, DatePipe, CurrencyPipe, RouterLink],
  templateUrl: './update-booking-status.html',
  styleUrl: './update-booking-status.scss',
})
export class UpdateBookingStatus {
  private readonly bookingService = inject(BookingService);
  private readonly slotService = inject(ServiceSlotService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly success = signal('');
  readonly bookings = signal<ProviderBookingStatusRow[]>([]);
  readonly selectedStatuses = signal<Record<string, BookingStatus>>({});
  readonly saving = signal(false);
  readonly savingBookingId = signal<string | null>(null);
  readonly statusOptions: BookingStatus[] = ['COMPLETED', 'CANCELLED'];

  constructor() {
    this.loadBookings();
  }

  private loadBookings(): void {
    this.loading.set(true);
    this.error.set('');

    this.bookingService
      .listByProvider(this.authService.currentUser().id)
      .pipe(
        switchMap((bookings) => {
          if (bookings.length === 0) {
            return of([] as ProviderBookingStatusRow[]);
          }

          return forkJoin(
            bookings.map((booking) =>
              this.slotService.getById(booking.slotId).pipe(
                map((slot) => ({
                  ...booking,
                  slotTitle: slot.origin
                    ? `${slot.origin} → ${slot.destination ?? 'Destination'}`
                    : (slot.locationName ?? slot.providerName),
                  categoryLabel: serviceCategoryLabel(slot.category),
                  startAt: slot.startAt,
                })),
                catchError(() =>
                  of({
                    ...booking,
                    slotTitle: 'Unknown service',
                    categoryLabel: '-',
                    startAt: booking.bookedAt,
                  })
                )
              )
            )
          );
        }),
        catchError((error: ApiError) => {
          this.error.set(error.message || 'Unable to load bookings.');
          this.bookings.set([]);
          return of([] as ProviderBookingStatusRow[]);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((bookings) => {
        this.bookings.set(bookings);
        this.selectedStatuses.set(
          Object.fromEntries(bookings.map((booking) => [booking.id, booking.status]))
        );
        this.loading.set(false);
      });
  }

  getStatusLabel(status: BookingStatus): string {
    return STATUS_LABELS[status];
  }

  selectedStatusFor(bookingId: string): BookingStatus {
    return this.selectedStatuses()[bookingId] ?? 'PENDING';
  }

  updateSelectedStatus(bookingId: string, status: BookingStatus): void {
    this.selectedStatuses.update((current) => ({
      ...current,
      [bookingId]: status,
    }));
  }

  updateStatus(bookingId: string): void {
    const nextStatus = this.selectedStatusFor(bookingId);
    const booking = this.bookings().find((item) => item.id === bookingId);

    if (!booking || nextStatus === booking.status) {
      return;
    }

    this.saving.set(true);
    this.savingBookingId.set(bookingId);
    this.error.set('');

    this.bookingService
      .updateStatus(bookingId, nextStatus)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.success.set(
            `Booking ${updated.id} updated to ${STATUS_LABELS[updated.status]}.`
          );
          this.saving.set(false);
          this.savingBookingId.set(null);
          this.loadBookings();
        },
        error: (error: ApiError) => {
          this.error.set(error.message || 'Unable to update booking status.');
          this.saving.set(false);
          this.savingBookingId.set(null);
        },
      });
  }
}
