import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { catchError, of } from 'rxjs';
import { ProviderService } from '../../../../core/services/provider';
import { AuthService } from '../../../../core/services/auth';
import { ExportColumn, TableExportService } from '../../../../core/services/table-export';
import { CommissionResponse } from '../../../../models/commission.model';
import { ProviderResponse } from '../../../../models/provider.model';
import { ApiError } from '../../../../models/api-error.model';

const EXPORT_COLUMNS: ExportColumn[] = [
  { header: 'Booking', key: 'bookingId' },
  { header: 'Category', key: 'serviceCategory' },
  { header: 'Commission %', key: 'percentage' },
  { header: 'Commission Amount (BDT)', key: 'amount' },
  { header: 'Date', key: 'calculatedDate' },
  { header: 'Status', key: 'settlementStatus' },
];

@Component({
  selector: 'app-provider-ledger',
  imports: [DatePipe],
  templateUrl: './ledger.html',
  styleUrl: './ledger.scss',
})
export class Ledger {
  private readonly providerService = inject(ProviderService);
  private readonly authService = inject(AuthService);
  private readonly tableExport = inject(TableExportService);
  private readonly destroyRef = inject(DestroyRef);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly rows = signal<CommissionResponse[]>([]);
  readonly totalAmount = computed(() => this.rows().reduce((sum, row) => sum + row.amount, 0));
  private profile: ProviderResponse | null = null;

  constructor() {
    this.loadRows();
    this.loadProfile();
  }

  private loadRows(): void {
    this.loading.set(true);
    this.error.set('');
    this.providerService
      .listCommissions(this.authService.currentUser().id)
      .pipe(
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

  private loadProfile(): void {
    this.providerService
      .getById(this.authService.currentUser().id)
      .pipe(
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((profile) => {
        this.profile = profile;
      });
  }

  private footerContact(): string {
    const user = this.authService.currentUser();
    const parts = [
      this.profile?.businessName || user.name,
      this.profile?.email || user.email,
      this.profile?.phone,
      this.profile?.address,
    ].filter((part): part is string => !!part);
    return parts.join('  •  ');
  }

  exportExcel(): void {
    this.tableExport.exportExcel('earnings-ledger', EXPORT_COLUMNS, this.rows(), 'Ledger', {
      bookingId: 'Total',
      amount: this.totalAmount(),
    });
  }

  exportPdf(): void {
    this.tableExport.exportPdf(
      'earnings-ledger',
      EXPORT_COLUMNS,
      this.rows(),
      {
        reportTitle: 'Earnings Ledger Report',
        preparedByLabel: 'Prepared for',
        preparedByValue: this.profile?.businessName || this.authService.currentUser().name,
        footerContact: this.footerContact(),
      },
      { bookingId: 'Total', amount: this.totalAmount() }
    );
  }
}
