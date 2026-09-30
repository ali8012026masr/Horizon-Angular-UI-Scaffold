import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { BookingService } from '../../../../core/services/booking';
import { ServiceSlotService } from '../../../../core/services/service-slot';
import { GuideBookingService } from '../../../../core/services/guide-booking';
import { GuideService } from '../../../../core/services/guide';
import { AuthService } from '../../../../core/services/auth';
import { InvoiceData, TableExportService } from '../../../../core/services/table-export';
import { BookingResponse } from '../../../../models/booking.model';
import { GuideBookingResponse, GuideBookingStatus } from '../../../../models/guide-booking.model';
import { ServiceCategory, ServiceSlotResponse, serviceCategoryLabel } from '../../../../models/service-slot.model';
import { ApiError } from '../../../../models/api-error.model';

interface BookedServiceRow {
  id: string;
  kind: 'slot' | 'guide';
  category: ServiceCategory | null;
  slotTitle: string;
  amount: number;
  status: string;
  bookedAt: string;
  paid: boolean;
}

const GUIDE_STATUS_LABEL: Record<GuideBookingStatus, string> = {
  REQUESTED: 'PENDING',
  ACCEPTED: 'CONFIRMED',
  DECLINED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

@Component({
  selector: 'app-my-bookings',
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.scss',
})
export class MyBookings {
  private readonly bookingService = inject(BookingService);
  private readonly slotService = inject(ServiceSlotService);
  private readonly guideBookingService = inject(GuideBookingService);
  private readonly guideService = inject(GuideService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly tableExport = inject(TableExportService);

  readonly categoryLabel = serviceCategoryLabel;
  readonly loading = signal(true);
  readonly error = signal('');
  readonly rows = signal<BookedServiceRow[]>([]);
  readonly success = signal('');
  readonly invoiceError = signal('');
  readonly confirmedRows = computed(() =>
    this.rows().filter((row) => this.isConfirmed(row))
  );
  readonly confirmedTotal = computed(() =>
    this.confirmedRows().reduce((sum, row) => sum + row.amount, 0)
  );

  constructor() {
    this.loadBookings();
  }

  private loadBookings(): void {
    const touristId = this.authService.currentUser().id;
    this.loading.set(true);
    this.error.set('');

    forkJoin({
      slotRows: this.bookingService.listByTourist(touristId).pipe(
        switchMap((bookings) => this.attachSlotDetails(bookings)),
        catchError((error: ApiError) => {
          this.error.set(error.message);
          return of([] as BookedServiceRow[]);
        })
      ),
      guideRows: this.guideBookingService.listByTourist(touristId).pipe(
        switchMap((bookings) => this.attachGuideDetails(bookings)),
        catchError((error: ApiError) => {
          this.error.set(error.message);
          return of([] as BookedServiceRow[]);
        })
      ),
    })
      .pipe(
        map(({ slotRows, guideRows }) =>
          [...slotRows, ...guideRows].sort((a, b) => (a.bookedAt < b.bookedAt ? 1 : -1))
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((rows) => {
        this.rows.set(rows);
        this.loading.set(false);
      });
  }

  private attachSlotDetails(bookings: BookingResponse[]) {
    if (bookings.length === 0) {
      return of([] as BookedServiceRow[]);
    }

    return forkJoin(
      bookings.map((booking) =>
        this.slotService.getById(booking.slotId).pipe(
          map((slot) => this.toSlotRow(booking, slot)),
          catchError(() => of(this.toSlotRow(booking, null)))
        )
      )
    );
  }

  private toSlotRow(booking: BookingResponse, slot: ServiceSlotResponse | null): BookedServiceRow {
    return {
      id: booking.id,
      kind: 'slot',
      category: slot?.category ?? null,
      slotTitle: slot ? (slot.origin ? `${slot.origin} -> ${slot.destination}` : (slot.locationName ?? slot.providerName)) : 'Unknown service',
      amount: booking.amount,
      status: booking.status,
      bookedAt: booking.bookedAt,
      paid: booking.paymentStatus === 'PAID',
    };
  }

  isConfirmed(row: BookedServiceRow): boolean {
    return row.status !== 'CANCELLED' && (row.paid || row.status === 'CONFIRMED' || row.status === 'COMPLETED');
  }

  async downloadInvoice(single?: BookedServiceRow): Promise<void> {
    this.invoiceError.set('');
    const rows = single ? [single] : this.confirmedRows();
    if (rows.length === 0) {
      this.invoiceError.set('No confirmed or paid bookings to invoice yet.');
      return;
    }
    try {
      const user = this.authService.currentUser();
      const now = new Date();
      const stamp = now.toISOString().slice(0, 10).replace(/-/g, '');
      const invoiceNo = single
        ? `INV-${String(single.id).slice(0, 8).toUpperCase()}`
        : `INV-${stamp}-${String(user.id).slice(0, 6).toUpperCase()}`;
      const lines = rows.map((row) => ({
        description: String(row.slotTitle ?? ''),
        category: row.category ? serviceCategoryLabel(row.category) : 'Guide',
        date: new Date(row.bookedAt).toLocaleDateString(),
        status: String(row.status ?? ''),
        amount: Number(row.amount) || 0,
      }));
      const invoice: InvoiceData = {
        invoiceNo,
        issuedOn: now.toLocaleDateString(),
        customerName: String(user.name ?? ''),
        customerEmail: String(user.email ?? ''),
        paymentStatus: 'PAID',
        lines,
        total: lines.reduce((sum, line) => sum + line.amount, 0),
      };
      await this.tableExport.exportInvoicePdf(invoiceNo, invoice);
    } catch (err) {
      console.error('Invoice export failed', err);
      this.invoiceError.set(
        `Could not generate the invoice PDF: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  canCancel(row: BookedServiceRow): boolean {
    return row.status !== 'CANCELLED' && row.status !== 'COMPLETED';
  }

  cancelBooking(row: BookedServiceRow): void {
    if (!this.canCancel(row)) {
      return;
    }

    this.success.set('');
    const request$ = (row.kind === 'slot'
      ? this.bookingService.updateStatus(row.id, 'CANCELLED')
      : this.guideBookingService.updateStatus(row.id, 'DECLINED')) as Observable<
      BookingResponse | GuideBookingResponse
    >;

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.success.set('Booking cancelled successfully.');
          this.loadBookings();
        },
        error: (error: ApiError) => {
          this.error.set(error.message || 'Unable to cancel this booking.');
        },
      });
  }

  private attachGuideDetails(bookings: GuideBookingResponse[]) {
    if (bookings.length === 0) {
      return of([] as BookedServiceRow[]);
    }

    return forkJoin(
      bookings.map((booking) =>
        this.guideService.getById(booking.tourGuideId).pipe(
          map((guide) => this.toGuideRow(booking, guide.fullName)),
          catchError(() => of(this.toGuideRow(booking, null)))
        )
      )
    );
  }

  private toGuideRow(booking: GuideBookingResponse, guideName: string | null): BookedServiceRow {
    return {
      id: booking.id,
      kind: 'guide',
      category: null,
      slotTitle: guideName ? `Guide: ${guideName}` : 'Tour guide booking',
      amount: booking.agreedPrice,
      status: GUIDE_STATUS_LABEL[booking.status],
      bookedAt: booking.scheduleDate,
      paid: booking.status === 'ACCEPTED' || booking.status === 'COMPLETED',
    };
  }
}
