export type SettlementStatus = 'PENDING' | 'SETTLED';

export interface CommissionResponse {
  id: string;
  bookingId: string;
  providerName: string;
  serviceCategory: string;
  percentage: number;
  amount: number;
  calculatedDate: string;
  settlementStatus: SettlementStatus;
}

export interface CommissionSearchRequest {
  dateFrom?: string;
  dateTo?: string;
  settlementStatus?: SettlementStatus;
}
