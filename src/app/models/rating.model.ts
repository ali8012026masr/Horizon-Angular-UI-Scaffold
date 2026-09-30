/** Raw shape returned by the backend (GuideRatingResponse.java). */
export interface GuideRatingResponse {
  id: string;
  guideBookingId: string;
  score: number;
  comment: string;
  ratedDate: string;
}

export interface CreateGuideRatingRequest {
  guideBookingId: string;
  score: number;
  comment: string;
}

/** Raw shape returned by the backend (ServiceRatingResponse.java). */
export interface ServiceRatingResponse {
  id: string;
  bookingId: string;
  touristId: string;
  providerId: string;
  score: number;
  comment: string;
  ratedDate: string;
}

export interface CreateServiceRatingRequest {
  bookingId: string;
  providerId: string;
  touristId: string;
  score: number;
  comment: string;
}
