/** Raw shape returned by the backend (TouristResponse.java). */
export interface TouristResponse {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  status: string;
  loyaltyPoints: number;
}

export interface UpdateTouristRequest {
  fullName?: string;
  phone?: string;
  address?: string;
}
