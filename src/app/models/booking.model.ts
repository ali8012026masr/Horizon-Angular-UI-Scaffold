export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';

export interface BookingResponse {
  id: string;
  slotId: string;
  touristId: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  amount: number;
  bookedAt: string;
}

export interface CreateBookingRequest {
  slotId: string;
  touristId: string;
}

/** Raw shape returned by the backend (BookingResponse.java) before mapping to BookingResponse above. */
export interface RawBookingResponse {
  id: string;
  touristId: string;
  serviceSlotId: string;
  bookingDate: string;
  status: BookingStatus;
  totalAmount: number;
  paymentStatus: PaymentStatus;
}
