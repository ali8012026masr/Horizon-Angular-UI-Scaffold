export interface GuideAvailabilityResponse {
  id: string;
  tourGuideId: string;
  tourGuideName: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  notes?: string;
  status: string;
  tourGuideRatingAvg: number;
  tourGuideRatingCount: number;
}

export interface CreateGuideAvailabilityRequest {
  tourGuideId: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  notes?: string;
}

export interface GuideAvailabilitySearchRequest {
  dateFrom?: string;
  dateTo?: string;
  location?: string;
}
