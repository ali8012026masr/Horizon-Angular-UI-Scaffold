export type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE_BANKING';

export type PaymentTxStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface PaymentResponse {
  id: string;
  bookingId?: string;
  guideBookingId?: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentTxStatus;
  transactionDate?: string;
}

export interface PaymentSearchRequest {
  dateFrom?: string;
  dateTo?: string;
  status?: PaymentTxStatus;
  method?: PaymentMethod;
}

export interface CreatePaymentRequest {
  bookingId?: string;
  guideBookingId?: string;
  amount: number;
  method: PaymentMethod;
}
