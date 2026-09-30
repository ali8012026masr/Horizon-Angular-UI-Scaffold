import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { catchError, map, of } from 'rxjs';
import { GuideBookingService } from '../../../../core/services/guide-booking';
import { AuthService } from '../../../../core/services/auth';
import { GuideBookingRequest } from '../../../../models/guide.model';
import { GuideBookingStatus } from '../../../../models/guide-booking.model';
import { ApiError } from '../../../../models/api-error.model';

const STATUS_MAP: Record<GuideBookingStatus, GuideBookingRequest['status']> = {
  REQUESTED: 'Pending',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
  COMPLETED: 'Completed',
};

@Component({
  selector: 'app-guide-bookings',
  imports: [DatePipe],
  templateUrl: './bookings.html',
  styleUrl: './bookings.scss',
})
export class Bookings {
  private readonly guideBookingService = inject(GuideBookingService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly requests = signal<GuideBookingRequest[]>([]);

  constructor() {
    this.loadRequests();
  }

  private loadRequests(): void {
    this.loading.set(true);
    this.error.set('');
    this.guideBookingService
      .listByGuide(this.authService.currentUser().id)
      .pipe(
        map((responses) =>
          responses.map((response) => ({
            id: response.id,
            tourist: response.touristId,
            tourLocation: '',
            scheduledDate: response.scheduleDate,
            status: STATUS_MAP[response.status],
            amount: response.agreedPrice,
          }))
        ),
        catchError((error: ApiError) => {
          this.error.set(error.message);
          return of([]);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((data) => {
        this.requests.set(data);
        this.loading.set(false);
      });
  }

  accept(requestId: string): void {
    this.guideBookingService
      .updateStatus(requestId, 'ACCEPTED')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadRequests());
  }

  decline(requestId: string): void {
    this.guideBookingService
      .updateStatus(requestId, 'DECLINED')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadRequests());
  }
}
