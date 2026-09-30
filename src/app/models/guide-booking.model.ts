export type GuideBookingStatus = 'REQUESTED' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';

/** Raw shape returned by the backend (GuideBookingResponse.java). */
export interface GuideBookingResponse {
  id: string;
  touristId: string;
  tourGuideId: string;
  guideAvailabilityId: string;
  scheduleDate: string;
  agreedPrice: number;
  isNegotiated: boolean;
  status: GuideBookingStatus;
  paymentReceived: boolean;
}

export interface CreateGuideBookingRequest {
  touristId: string;
  tourGuideId: string;
  guideAvailabilityId: string;
  scheduleDate: string;
  agreedPrice: number;
  isNegotiated: boolean;
}
