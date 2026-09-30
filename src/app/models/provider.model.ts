/** Raw shape returned by the backend (ProviderResponse.java). */
export interface ProviderResponse {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  status: string;
  businessName: string;
  tradeLicenseNo: string;
  category: string;
  verificationStatus: string;
  rejectionReason?: string;
  commissionRate: number;
  ratingAvg: number;
  ratingCount: number;
}

export interface UpdateProviderRequest {
  fullName?: string;
  phone?: string;
  address?: string;
  businessName?: string;
  tradeLicenseNo?: string;
  category?: string;
  commissionRate?: number;
}
