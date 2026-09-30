import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { AuthService } from '../../../../core/services/auth';
import { BookingService } from '../../../../core/services/booking';
import { GroupService } from '../../../../core/services/group';
import { ServiceSlotService } from '../../../../core/services/service-slot';
import { ServiceSlotResponse } from '../../../../models/service-slot.model';
import { ApiError } from '../../../../models/api-error.model';

@Component({
  selector: 'app-group-booking',
  imports: [RouterLink, DatePipe],
  templateUrl: './group-booking.html',
  styleUrl: './group-booking.scss',
})
export class GroupBooking {
  private readonly slotService = inject(ServiceSlotService);
  private readonly bookingService = inject(BookingService);
  private readonly groupService = inject(GroupService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly slots = signal<ServiceSlotResponse[]>([]);
  readonly choosingId = signal<string | null>(null);
  readonly groupId = signal<string | null>(null);

  constructor() {
    this.groupId.set(this.route.snapshot.queryParamMap.get('groupId'));

    this.slotService
      .search({})
      .pipe(
        map((slots) => slots.filter((slot) => !!slot.origin)),
        catchError((error: ApiError) => {
          this.error.set(error.message);
          return of([]);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((slots) => {
        this.slots.set(slots);
        this.loading.set(false);
      });
  }

  choose(slot: ServiceSlotResponse): void {
    const groupId = this.groupId();
    if (!groupId) {
      this.error.set('No group selected. Create or join a group first.');
      return;
    }

    this.choosingId.set(slot.id);
    this.error.set('');

    this.bookingService
      .create({ slotId: slot.id, touristId: this.authService.currentUser().id })
      .pipe(
        switchMap((booking) => this.groupService.attachBooking(groupId, { bookingId: booking.id })),
        catchError((error: ApiError) => {
          this.error.set(error.message || 'Unable to book this slot for the group.');
          this.choosingId.set(null);
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response) => {
        if (!response) {
          return;
        }
        this.choosingId.set(null);
        void this.router.navigate(['/tourist/group/join'], { queryParams: { groupId } });
      });
  }
}
