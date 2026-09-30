export type ServiceCategory =
  | 'BUS'
  | 'MICROBUS'
  | 'LAUNCH'
  | 'TRAIN'
  | 'AIRPLANE'
  | 'SHIP'
  | 'HOTEL'
  | 'RESORT'
  | 'CONVENTION_CENTER'
  | 'BUFFET'
  | 'AMUSEMENT_PARK';

export const SERVICE_CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: 'BUS', label: 'Bus' },
  { value: 'MICROBUS', label: 'Micro-bus' },
  { value: 'LAUNCH', label: 'Launch' },
  { value: 'TRAIN', label: 'Train' },
  { value: 'AIRPLANE', label: 'Airplane' },
  { value: 'SHIP', label: 'Ship' },
  { value: 'HOTEL', label: 'Hotel' },
  { value: 'RESORT', label: 'Resort' },
  { value: 'CONVENTION_CENTER', label: 'Convention Center' },
  { value: 'BUFFET', label: 'Buffet' },
  { value: 'AMUSEMENT_PARK', label: 'Amusement Park' },
];

export function serviceCategoryLabel(category: ServiceCategory): string {
  return SERVICE_CATEGORIES.find((entry) => entry.value === category)?.label ?? category;
}

export type SlotStatus = 'OPEN' | 'FULL' | 'CLOSED' | 'CANCELLED';

export interface ServiceSlotResponse {
  id: string;
  providerId: string;
  providerName: string;
  category: ServiceCategory;
  origin?: string;
  destination?: string;
  locationName?: string;
  startAt: string;
  endAt?: string;
  capacity: number;
  availableSeats: number;
  price: number;
  status: SlotStatus;
  providerRatingAvg: number;
  providerRatingCount: number;
}

/** Raw shape returned by the backend (ServiceSlotResponse.java). */
export interface RawServiceSlotResponse {
  id: string;
  providerId: string;
  providerBusinessName: string;
  category: ServiceCategory;
  origin?: string;
  destination?: string;
  locationName?: string;
  startDateTime: string;
  endDateTime?: string;
  capacity: number;
  availableSeats: number;
  price: number;
  status: SlotStatus;
  providerRatingAvg: number;
  providerRatingCount: number;
}

export interface CreateServiceSlotRequest {
  providerId: string;
  category: ServiceCategory;
  origin?: string;
  destination?: string;
  locationName?: string;
  startAt: string;
  endAt?: string;
  capacity: number;
  price: number;
}

export interface UpdateServiceSlotRequest {
  origin?: string;
  destination?: string;
  locationName?: string;
  startAt?: string;
  endAt?: string;
  capacity?: number;
  price?: number;
}

export interface ServiceSlotSearchRequest {
  category?: ServiceCategory;
  origin?: string;
  destination?: string;
  locationName?: string;
  dateFrom?: string;
  dateTo?: string;
  minPrice?: number;
  maxPrice?: number;
}
