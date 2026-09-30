export type SlotCategory =
  | 'Bus'
  | 'Micro-bus'
  | 'Launch'
  | 'Train'
  | 'Airplane'
  | 'Ship'
  | 'Hotel'
  | 'Resort'
  | 'Convention Center'
  | 'Buffet'
  | 'Amusement Park';

export interface Slot {
  id: string;
  category: SlotCategory;
  providerName: string;
  /** Transport categories only: departure point. */
  origin?: string;
  /** Transport categories only: arrival point. */
  destination?: string;
  /** Stay/venue/dining/amusement categories only: single site location. */
  location?: any;
  startAt: string;
  /** Stay categories only: check-out date/time. */
  endAt?: string;
  capacity: number;
  availableSeats: number;
  price: number;
}
