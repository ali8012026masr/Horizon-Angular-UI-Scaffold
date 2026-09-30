export interface RegistrationField {
  label: string;
  value: string | number | boolean | string[] | null | undefined;
}

export interface PendingRegistration {
  id: string;
  applicantName: string;
  applicantType: 'Service Provider' | 'Tour Guide';
  submittedAt?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  details?: string;
  summary?: string;
  fields?: RegistrationField[];
}

export interface RoleUser {
  id: string;
  name: string;
  role: 'tourist' | 'provider' | 'guide' | 'admin';
  status: 'Active' | 'Suspended' | 'Revoked';
  email: string;
  createdAt: string;
}

export interface CommissionRow {
  id: string;
  serviceCategory: string;
  transactionDate: string;
  amount: number;
  commissionPercent: number;
  commissionAmount: number;
}

export interface ProviderLedgerRow {
  id: string;
  providerName: string;
  serviceCategory: string;
  amount: number;
  settlementDate: string;
  status: 'Settled' | 'Pending';
}

export interface ReportSummary {
  name: string;
  value: string;
  note?: string;
}
