import { Component, DestroyRef, inject, signal } from '@angular/core';
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
import { CommissionRow } from '../../../../models/admin.model';
import { ApiError } from '../../../../models/api-error.model';

const EXPORT_COLUMNS: ExportColumn[] = [
  { header: 'ID', key: 'id' },
  { header: 'Category', key: 'serviceCategory' },
  { header: 'Date', key: 'transactionDate' },
  { header: 'Amount (BDT)', key: 'amount' },
  { header: 'Rate (%)', key: 'commissionPercent' },
  { header: 'Commission (BDT)', key: 'commissionAmount' },
];

@Component({
  selector: 'app-admin-commission',
  imports: [DatePipe],
  templateUrl: './commission.html',
  styleUrl: './commission.scss',
})
export class Commission {
  private readonly adminService = inject(AdminService);
  private readonly authService = inject(AuthService);
  private readonly tableExport = inject(TableExportService);
  private readonly destroyRef = inject(DestroyRef);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly rows = signal<CommissionRow[]>([]);

  constructor() {
    this.loadRows();
  }

  private loadRows(): void {
    this.loading.set(true);
    this.error.set('');
    this.adminService
      .listCommissions({})
      .pipe(
        map((rows) =>
          rows.map((row) => ({
            id: row.id,
            serviceCategory: row.serviceCategory,
            transactionDate: row.calculatedDate,
            amount: row.amount,
            commissionPercent: row.percentage,
            commissionAmount: row.amount,
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
    this.tableExport.exportExcel('commission-calculation', EXPORT_COLUMNS, this.rows(), 'Commission');
  }

  exportPdf(): void {
    this.tableExport.exportPdf('commission-calculation', EXPORT_COLUMNS, this.rows(), {
      reportTitle: 'Commission Calculation Report',
      preparedByLabel: 'Prepared by',
      preparedByValue: this.authService.currentUser().name,
      footerContact: HORIZON_PLATFORM_CONTACT,
    });
  }
}
