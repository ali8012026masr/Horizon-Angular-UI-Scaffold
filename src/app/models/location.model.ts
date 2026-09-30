export interface UpdateLocationRequest {
  latitude: number;
  longitude: number;
}

/** Raw shape returned by the backend (LocationResponse.java). */
export interface LocationResponse {
  tourGuideId: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
}
