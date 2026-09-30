export interface RevenueSummaryResponse {
  totalRevenue: number;
  dateFrom: string;
  dateTo: string;
}

export interface BookingsSummaryResponse {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  dateFrom: string;
  dateTo: string;
}

export interface CommissionSummaryResponse {
  totalCommission: number;
  settledCommission: number;
  pendingCommission: number;
  dateFrom: string;
  dateTo: string;
}
