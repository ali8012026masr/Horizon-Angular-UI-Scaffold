import { Injectable } from '@angular/core';
import { utils, writeFile } from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportColumn {
  header: string;
  key: string;
}

export interface PdfReportOptions {
  reportTitle: string;
  preparedByLabel: string;
  preparedByValue: string;
  footerContact: string;
}

export interface InvoiceLine {
  description: string;
  category: string;
  date: string;
  status: string;
  amount: number;
}

export interface InvoiceData {
  invoiceNo: string;
  issuedOn: string;
  customerName: string;
  customerEmail: string;
  paymentStatus: string;
  lines: InvoiceLine[];
  total: number;
}

export const HORIZON_PLATFORM_CONTACT =
  'www.horizon.app  •  support@horizon.app  •  +880-1700-000000';

const LOGO_URL = 'assets/Horizon_f_logo.png';
const BRAND_NAVY: [number, number, number] = [17, 60, 92];
const BRAND_TEAL: [number, number, number] = [30, 144, 138];
const HEADER_HEIGHT = 32;
const FOOTER_HEIGHT = 16;

@Injectable({ providedIn: 'root' })
export class TableExportService {
  private logoDataUrl: Promise<string | null> | null = null;

  exportExcel<T extends object>(
    filename: string,
    columns: ExportColumn[],
    rows: T[],
    sheetName = 'Sheet1',
    totalRow?: Record<string, unknown>
  ): void {
    const data = rows.map((row) =>
      Object.fromEntries(
        columns.map((column) => [column.header, (row as Record<string, unknown>)[column.key]])
      )
    );
    if (totalRow) {
      data.push(
        Object.fromEntries(columns.map((column) => [column.header, totalRow[column.key] ?? '']))
      );
    }
    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, sheetName);
    writeFile(workbook, `${filename}.xlsx`);
  }

  async exportPdf<T extends object>(
    filename: string,
    columns: ExportColumn[],
    rows: T[],
    options: PdfReportOptions,
    totalRow?: Record<string, unknown>
  ): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const logo = await this.getLogoDataUrl();

    this.drawHeader(doc, pageWidth, options, logo);

    const body = rows.map((row) =>
      columns.map((column) => String((row as Record<string, unknown>)[column.key] ?? ''))
    );
    if (totalRow) {
      body.push(columns.map((column) => String(totalRow[column.key] ?? '')));
    }

    autoTable(doc, {
      startY: HEADER_HEIGHT + 8,
      head: [columns.map((column) => column.header)],
      body,
      theme: 'striped',
      headStyles: { fillColor: BRAND_TEAL, textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { bottom: FOOTER_HEIGHT + 6 },
      didParseCell: (data) => {
        if (totalRow && data.section === 'body' && data.row.index === body.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [230, 236, 240];
        }
      },
    });

    const totalPages = doc.getNumberOfPages();
    for (let page = 1; page <= totalPages; page++) {
      doc.setPage(page);
      this.drawFooter(doc, pageWidth, options.footerContact, page, totalPages);
    }

    doc.save(`${filename}.pdf`);
  }

  async exportInvoicePdf(filename: string, invoice: InvoiceData): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const logo = await this.getLogoDataUrl();
    const options: PdfReportOptions = {
      reportTitle: 'INVOICE',
      preparedByLabel: 'Invoice No.',
      preparedByValue: invoice.invoiceNo,
      footerContact: HORIZON_PLATFORM_CONTACT,
    };

    this.drawHeader(doc, pageWidth, options, logo);

    let y = HEADER_HEIGHT + 12;
    doc.setTextColor(...BRAND_NAVY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('BILLED TO', 14, y);
    doc.text('INVOICE DETAILS', pageWidth / 2 + 10, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(invoice.customerName, 14, y + 6);
    doc.text(invoice.customerEmail, 14, y + 11);
    doc.text(`Issue date: ${invoice.issuedOn}`, pageWidth / 2 + 10, y + 6);
    doc.text(`Payment status: ${invoice.paymentStatus}`, pageWidth / 2 + 10, y + 11);
    doc.text(`Items: ${invoice.lines.length}`, pageWidth / 2 + 10, y + 16);
    y += 24;

    const body = invoice.lines.map((line, index) => [
      String(index + 1),
      line.description,
      line.category,
      line.date,
      line.status,
      line.amount.toLocaleString('en-US'),
    ]);

    autoTable(doc, {
      startY: y,
      head: [['#', 'Service', 'Category', 'Booked On', 'Status', 'Amount (BDT)']],
      body,
      theme: 'striped',
      headStyles: { fillColor: BRAND_TEAL, textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 10 }, 5: { halign: 'right' } },
      margin: { bottom: FOOTER_HEIGHT + 6 },
    });

    const lastY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
    let totalsY = lastY + 10;
    if (totalsY + 30 > pageHeight - FOOTER_HEIGHT) {
      doc.addPage();
      totalsY = 20;
    }

    const boxWidth = 80;
    const boxX = pageWidth - 14 - boxWidth;
    doc.setFillColor(230, 236, 240);
    doc.rect(boxX, totalsY, boxWidth, 20, 'F');
    doc.setTextColor(...BRAND_NAVY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TOTAL EXPENSES', boxX + 4, totalsY + 8);
    doc.setFontSize(13);
    doc.text(`BDT ${invoice.total.toLocaleString('en-US')}`, boxX + boxWidth - 4, totalsY + 16, {
      align: 'right',
    });

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(110, 110, 110);
    doc.text(
      'This is a computer-generated invoice and does not require a signature. Thank you for travelling with Horizon.',
      14,
      totalsY + 30
    );

    const totalPages = doc.getNumberOfPages();
    for (let page = 1; page <= totalPages; page++) {
      doc.setPage(page);
      this.drawFooter(doc, pageWidth, options.footerContact, page, totalPages);
    }

    doc.save(`${filename}.pdf`);
  }

  private drawHeader(
    doc: jsPDF,
    pageWidth: number,
    options: PdfReportOptions,
    logo: string | null
  ): void {
    doc.setFillColor(...BRAND_NAVY);
    doc.rect(0, 0, pageWidth, HEADER_HEIGHT, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(options.reportTitle, 14, 15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Horizon All-in-One Travel Solutions', 14, 22);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 27);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(options.preparedByLabel, pageWidth - 14, 11, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text(options.preparedByValue, pageWidth - 14, 16, { align: 'right' });

    if (logo) {
      const logoWidth = 38;
      const logoHeight = 11;
      doc.addImage(logo, 'PNG', pageWidth - 14 - logoWidth, 20, logoWidth, logoHeight);
    }
  }

  private drawFooter(
    doc: jsPDF,
    pageWidth: number,
    contact: string,
    page: number,
    totalPages: number
  ): void {
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFillColor(...BRAND_NAVY);
    doc.rect(0, pageHeight - FOOTER_HEIGHT, pageWidth, FOOTER_HEIGHT, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(contact, pageWidth / 2, pageHeight - 9, { align: 'center' });
    doc.text(`Page ${page} of ${totalPages}`, pageWidth / 2, pageHeight - 4, { align: 'center' });
  }

  private getLogoDataUrl(): Promise<string | null> {
    if (!this.logoDataUrl) {
      this.logoDataUrl = fetch(LOGO_URL)
        .then((response) => (response.ok ? response.blob() : null))
        .then(
          (blob) =>
            blob &&
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            })
        )
        .catch(() => null);
    }
    return this.logoDataUrl;
  }
}
