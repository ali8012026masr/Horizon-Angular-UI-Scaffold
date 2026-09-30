import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { SlotCategory } from '../models/slot.model';

export interface ProviderBookingRow {
  id: string;
  customer: string;
  category: SlotCategory;
  slot: string;
  status: 'Confirmed' | 'Completed';
  amount: number;
}

@Injectable({ providedIn: 'root' })
export class ProviderDataService {
  private readonly bookings: ProviderBookingRow[] = [
    {
      id: 'PB-101',
      customer: 'Rafi Ahmed',
      category: 'Bus',
      slot: "Dhaka -> Cox's Bazar Bus",
      status: 'Confirmed',
      amount: 1800,
    },
    {
      id: 'PB-102',
      customer: 'Tanvir Hasan',
      category: 'Micro-bus',
      slot: 'Dhaka -> Chittagong Micro-bus',
      status: 'Confirmed',
      amount: 1200,
    },
    {
      id: 'PB-103',
      customer: 'Sajib Talukder',
      category: 'Launch',
      slot: 'Rangamati -> Kaptai Launch',
      status: 'Confirmed',
      amount: 1500,
    },
    {
      id: 'PB-104',
      customer: 'Kamrul Islam',
      category: 'Train',
      slot: 'Dhaka -> Sylhet Train',
      status: 'Confirmed',
      amount: 900,
    },
    {
      id: 'PB-105',
      customer: 'Mahin Sarker',
      category: 'Airplane',
      slot: "Dhaka -> Cox's Bazar Flight",
      status: 'Completed',
      amount: 5800,
    },
    {
      id: 'PB-106',
      customer: 'Farhan Chowdhury',
      category: 'Ship',
      slot: "Teknaf -> Saint Martin's Ship",
      status: 'Confirmed',
      amount: 2500,
    },
    {
      id: 'PB-107',
      customer: 'Jahid Hasan',
      category: 'Hotel',
      slot: "Cox's Bazar Hotel, 2 Nights",
      status: 'Completed',
      amount: 5500,
    },
    {
      id: 'PB-108',
      customer: 'Sadia Afrin',
      category: 'Resort',
      slot: "Cox's Bazar Resort, 1 Night",
      status: 'Completed',
      amount: 6200,
    },
    {
      id: 'PB-109',
      customer: 'Horizon Tours Ltd.',
      category: 'Convention Center',
      slot: 'Dhaka Convention Hall, Corporate Event',
      status: 'Confirmed',
      amount: 15000,
    },
    {
      id: 'PB-110',
      customer: 'Nusrat Jahan',
      category: 'Buffet',
      slot: "Cox's Bazar Beachside Buffet, Dinner",
      status: 'Completed',
      amount: 850,
    },
    {
      id: 'PB-111',
      customer: 'Amin Rahman',
      category: 'Amusement Park',
      slot: 'Sajek Valley Amusement Park, Day Pass',
      status: 'Confirmed',
      amount: 3000,
    },
  ];

  getBookings(): Observable<ProviderBookingRow[]> {
    return of(this.bookings).pipe(delay(300));
  }
}
