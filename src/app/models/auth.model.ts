export interface LoginRequest {
  email: string;
  password: string;
}

/** Raw shape returned by the backend (LoginResponse.java). */
export interface LoginResponse {
  id: string;
  fullName: string;
  email: string;
  role: string;
  roleDetails?: { status?: string } | null;
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/** Raw shape returned by the backend (MessageResponse.java). */
export interface MessageResponse {
  message: string;
}

export interface RegisterTouristRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface RegisterProviderRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  businessName: string;
  tradeLicenseNo?: string;
  nationalId?: string;
  category: string;
  commissionRate?: number;
}

export interface RegisterGuideRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  nationalId?: string;
  bio?: string;
  location?: string;
  languages?: string[];
  experienceYears?: number;
  defaultPrice?: number;
  negotiable?: boolean;
}
