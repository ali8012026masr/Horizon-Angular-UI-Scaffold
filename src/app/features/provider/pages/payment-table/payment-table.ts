import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import {
  TableExportService,
  ExportColumn,
  HORIZON_PLATFORM_CONTACT,
} from '../../../../core/services/table-export';
import { MOCK_PAYMENT_RECORDS, PaymentRecord } from '../../../../mock-data/payment-records';

const EXPORT_COLUMNS: ExportColumn[] = [
  { header: 'Invoice', key: 'invoice' },
  { header: 'Customer', key: 'customer' },
  { header: 'Service', key: 'service' },
  { header: 'Date', key: 'date' },
  { header: 'Amount (BDT)', key: 'amount' },
  { header: 'Status', key: 'status' },
];

@Component({
  selector: 'app-payment-table',
  imports: [CurrencyPipe],
  templateUrl: './payment-table.html',
  styleUrl: './payment-table.scss',
})
export class PaymentTable {
  private readonly tableExport = inject(TableExportService);

  readonly rows = signal<PaymentRecord[]>(MOCK_PAYMENT_RECORDS);

  readonly totalPaid = computed(() =>
    this.sumByStatus(this.rows(), 'Paid')
  );
  readonly totalPending = computed(() =>
    this.sumByStatus(this.rows(), 'Pending')
  );
  readonly totalRefunded = computed(() =>
    this.sumByStatus(this.rows(), 'Refunded')
  );
  readonly grandTotal = computed(() =>
    this.rows().reduce((sum, row) => sum + row.amount, 0)
  );

  private sumByStatus(rows: PaymentRecord[], status: PaymentRecord['status']): number {
    return rows
      .filter((row) => row.status === status)
      .reduce((sum, row) => sum + row.amount, 0);
  }

  exportExcel(): void {
    this.tableExport.exportExcel('payment-table', EXPORT_COLUMNS, this.rows(), 'Payments', {
      invoice: 'Total',
      amount: this.grandTotal(),
    });
  }

  exportPdf(): void {
    this.tableExport.exportPdf(
      'payment-table',
      EXPORT_COLUMNS,
      this.rows(),
      {
        reportTitle: 'Payment Table Report',
        preparedByLabel: 'Prepared by',
        preparedByValue: 'Horizon Platform',
        footerContact: HORIZON_PLATFORM_CONTACT,
      },
      { invoice: 'Total', amount: this.grandTotal() }
    );
  }
}
