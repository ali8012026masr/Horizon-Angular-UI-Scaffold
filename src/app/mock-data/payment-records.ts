export type PaymentStatus = 'Paid' | 'Pending' | 'Refunded';

export interface PaymentRecord {
  invoice: string;
  customer: string;
  service: string;
  date: string;
  amount: number;
  status: PaymentStatus;
}

export const MOCK_PAYMENT_RECORDS: PaymentRecord[] = [
  {
    invoice: '#INV-1001',
    customer: 'Mohammad Ali',
    service: "Dhaka to Cox's Bazar Bus",
    date: '2026-08-12',
    amount: 1800,
    status: 'Paid',
  },
  {
    invoice: '#INV-1002',
    customer: 'Rafi Ahmed',
    service: 'Hotel Booking',
    date: '2026-08-11',
    amount: 5500,
    status: 'Pending',
  },
  {
    invoice: '#INV-1003',
    customer: 'Farhana Karim',
    service: 'Chattogram Launch',
    date: '2026-08-10',
    amount: 2400,
    status: 'Paid',
  },
  {
    invoice: '#INV-1004',
    customer: 'Tanvir Hasan',
    service: 'Tour Guide Booking',
    date: '2026-08-09',
    amount: 3200,
    status: 'Refunded',
  },
];
