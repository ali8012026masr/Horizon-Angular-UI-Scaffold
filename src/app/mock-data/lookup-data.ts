import { Injectable } from '@angular/core';
import { SlotCategory } from '../models/slot.model';

@Injectable({ providedIn: 'root' })
export class LookupDataService {
  readonly slotCategories: SlotCategory[] = [
    'Bus',
    'Micro-bus',
    'Launch',
    'Train',
    'Airplane',
    'Ship',
    'Hotel',
    'Resort',
    'Convention Center',
    'Buffet',
    'Amusement Park',
  ];
}
