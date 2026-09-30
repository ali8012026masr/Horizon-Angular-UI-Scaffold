import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import {
  TableExportService,
  ExportColumn,
  HORIZON_PLATFORM_CONTACT,
} from '../../../../core/services/table-export';
import { MOCK_PAYMENT_RECORDS, PaymentRecord, PaymentStatus } from '../../../../mock-data/payment-records';

interface StatusSummaryRow {
  status: PaymentStatus;
  count: number;
  total: number;
}

const EXPORT_COLUMNS: ExportColumn[] = [
  { header: 'Status', key: 'status' },
  { header: 'Transactions', key: 'count' },
  { header: 'Total (BDT)', key: 'total' },
];

@Component({
  selector: 'app-export-summary',
  imports: [CurrencyPipe],
  templateUrl: './export-summary.html',
  styleUrl: './export-summary.scss',
})
export class ExportSummary {
  private readonly tableExport = inject(TableExportService);

  readonly rows = signal<PaymentRecord[]>(MOCK_PAYMENT_RECORDS);

  readonly summary = computed<StatusSummaryRow[]>(() => {
    const statuses: PaymentStatus[] = ['Paid', 'Pending', 'Refunded'];
    return statuses.map((status) => {
      const matching = this.rows().filter((row) => row.status === status);
      return {
        status,
        count: matching.length,
        total: matching.reduce((sum, row) => sum + row.amount, 0),
      };
    });
  });

  readonly grandTotal = computed(() =>
    this.rows().reduce((sum, row) => sum + row.amount, 0)
  );

  exportExcel(): void {
    this.tableExport.exportExcel('export-summary', EXPORT_COLUMNS, this.summary(), 'Summary', {
      status: 'Grand Total',
      total: this.grandTotal(),
    });
  }

  exportPdf(): void {
    this.tableExport.exportPdf(
      'export-summary',
      EXPORT_COLUMNS,
      this.summary(),
      {
        reportTitle: 'Payment Export Summary Report',
        preparedByLabel: 'Prepared by',
        preparedByValue: 'Horizon Platform',
        footerContact: HORIZON_PLATFORM_CONTACT,
      },
      { status: 'Grand Total', total: this.grandTotal() }
    );
  }
}
