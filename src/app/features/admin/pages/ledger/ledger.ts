import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { catchError, map, of } from 'rxjs';
import { AdminService } from '../../../../core/services/admin';
import { AuthService } from '../../../../core/services/auth';
import {
  ExportColumn,
  HORIZON_PLATFORM_CONTACT,
  TableExportService,
} from '../../../../core/services/table-export';
import { ProviderLedgerRow } from '../../../../models/admin.model';
import { ApiError } from '../../../../models/api-error.model';

const EXPORT_COLUMNS: ExportColumn[] = [
  { header: 'Provider', key: 'providerName' },
  { header: 'Category', key: 'serviceCategory' },
  { header: 'Amount (BDT)', key: 'amount' },
  { header: 'Settlement Date', key: 'settlementDate' },
  { header: 'Status', key: 'status' },
];

@Component({
  selector: 'app-admin-ledger',
  imports: [DatePipe],
  templateUrl: './ledger.html',
  styleUrl: './ledger.scss',
})
export class Ledger {
  private readonly adminService = inject(AdminService);
  private readonly authService = inject(AuthService);
  private readonly tableExport = inject(TableExportService);
  private readonly destroyRef = inject(DestroyRef);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly rows = signal<ProviderLedgerRow[]>([]);
  readonly totalAmount = computed(() => this.rows().reduce((sum, row) => sum + row.amount, 0));

  constructor() {
    this.loadRows();
  }

  private loadRows(): void {
    this.loading.set(true);
    this.error.set('');
    // No dedicated ledger endpoint exists yet - derived from commission settlement records.
    this.adminService
      .listCommissions({})
      .pipe(
        map((rows) =>
          rows.map((row) => ({
            id: row.id,
            providerName: row.providerName,
            serviceCategory: row.serviceCategory,
            amount: row.amount,
            settlementDate: row.calculatedDate,
            status: row.settlementStatus === 'SETTLED' ? ('Settled' as const) : ('Pending' as const),
          }))
        ),
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

  exportExcel(): void {
    this.tableExport.exportExcel('provider-ledger', EXPORT_COLUMNS, this.rows(), 'Ledger', {
      providerName: 'Total',
      amount: this.totalAmount(),
    });
  }

  exportPdf(): void {
    this.tableExport.exportPdf(
      'provider-ledger',
      EXPORT_COLUMNS,
      this.rows(),
      {
        reportTitle: 'Provider Ledger & Settlement Report',
        preparedByLabel: 'Prepared by',
        preparedByValue: this.authService.currentUser().name,
        footerContact: HORIZON_PLATFORM_CONTACT,
      },
      { providerName: 'Total', amount: this.totalAmount() }
    );
  }
}
