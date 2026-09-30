export interface UpdateGuideRequest {
  fullName?: string;
  phone?: string;
  address?: string;
  bio?: string;
  isAvailable?: boolean;
  languages?: string[];
  location?: string;
  experienceYears?: number;
  defaultPrice?: number;
  negotiable?: boolean;
}

/** Raw shape returned by the backend (GuideResponse.java). */
export interface GuideResponse {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  status: string;
  nationalId?: string;
  bio?: string;
  ratingAvg: number;
  ratingCount: number;
  isAvailable: boolean;
  verificationStatus: string;
  rejectionReason?: string;
  languages: string[];
  location: string;
  experienceYears: number;
  defaultPrice: number;
  negotiable: boolean;
}

export interface GuideProfile {
  id: string;
  name: string;
  location: string;
  languages: string[];
  rating: number;
  priceLabel: string;
  negotiable: boolean;
}

export interface GuideBookingRequest {
  id: string;
  tourist: string;
  tourLocation: string;
  scheduledDate: string;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Completed';
  amount: number;
}

export interface GuideRating {
  id: string;
  tourist: string;
  score: number;
  comment: string;
  receivedAt: string;
}
