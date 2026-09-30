export interface TrackingPoint {
  entity: 'Tourist' | 'Guide' | 'Tour Mate';
  name: string;
  place: string;
  lat: number;
  lng: number;
  updatedAt: string;
}
