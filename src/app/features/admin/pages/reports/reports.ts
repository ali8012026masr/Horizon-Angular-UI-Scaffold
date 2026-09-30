import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of } from 'rxjs';
import { AdminService } from '../../../../core/services/admin';
import { ReportSummary } from '../../../../models/admin.model';
import { ApiError } from '../../../../models/api-error.model';

@Component({
  selector: 'app-admin-reports',
  imports: [],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports {
  private readonly adminService = inject(AdminService);
  private readonly destroyRef = inject(DestroyRef);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly summary = signal<ReportSummary[]>([]);

  constructor() {
    this.loadSummary();
  }

  private loadSummary(): void {
    this.loading.set(true);
    this.error.set('');
    forkJoin({
      revenue: this.adminService.getRevenueSummary(),
      bookings: this.adminService.getBookingsSummary(),
      commission: this.adminService.getCommissionSummary(),
    })
      .pipe(
        map(({ revenue, bookings, commission }): ReportSummary[] => [
          { name: 'Total Revenue', value: `৳${revenue.totalRevenue.toLocaleString()}`, note: 'Selected period' },
          { name: 'Bookings Completed', value: `${bookings.completedBookings}`, note: `${bookings.totalBookings} total bookings` },
          { name: 'Commission Collected', value: `৳${commission.settledCommission.toLocaleString()}`, note: `৳${commission.pendingCommission.toLocaleString()} pending` },
        ]),
        catchError((error: ApiError) => {
          this.error.set(error.message);
          return of([]);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((data) => {
        this.summary.set(data);
        this.loading.set(false);
      });
  }
}
