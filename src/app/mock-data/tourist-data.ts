import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { TrackingPoint } from '../models/tracking.model';

@Injectable({ providedIn: 'root' })
export class TouristDataService {
  getTrackingPoints(): Observable<TrackingPoint[]> {
    const data: TrackingPoint[] = [
      {
        entity: 'Tourist',
        name: 'You',
        place: "Cox's Bazar",
        lat: 21.4272,
        lng: 92.0058,
        updatedAt: new Date().toISOString(),
      },
      {
        entity: 'Guide',
        name: 'Zamal Uddin',
        place: "Cox's Bazar",
        lat: 21.4272,
        lng: 92.0058,
        updatedAt: new Date().toISOString(),
      },
      {
        entity: 'Tour Mate',
        name: 'Rafi',
        place: "Cox's Bazar",
        lat: 21.4291,
        lng: 92.0061,
        updatedAt: new Date().toISOString(),
      },
      {
        entity: 'Tour Mate',
        name: 'Amin',
        place: "Cox's Bazar",
        lat: 21.4300,
        lng: 92.0070,
        updatedAt: new Date().toISOString(),
      },
      {
        entity: 'Guide',
        name: 'Minhaj Karim',
        place: 'Sajek Valley',
        lat: 22.4990,
        lng: 92.2932,
        updatedAt: new Date().toISOString(),
      },
      {
        entity: 'Tour Mate',
        name: 'Nusrat',
        place: 'Sajek Valley',
        lat: 22.4995,
        lng: 92.2940,
        updatedAt: new Date().toISOString(),
      },
      {
        entity: 'Guide',
        name: 'Farhan Chowdhury',
        place: "Saint Martin's Island",
        lat: 20.6270,
        lng: 92.3200,
        updatedAt: new Date().toISOString(),
      },
      {
        entity: 'Tour Mate',
        name: 'Sadia',
        place: "Saint Martin's Island",
        lat: 20.6275,
        lng: 92.3210,
        updatedAt: new Date().toISOString(),
      },
      {
        entity: 'Guide',
        name: 'Kamrul Islam',
        place: 'Bandarban',
        lat: 22.1953,
        lng: 92.2184,
        updatedAt: new Date().toISOString(),
      },
      {
        entity: 'Tour Mate',
        name: 'Tanvir',
        place: 'Rangamati',
        lat: 22.6533,
        lng: 92.1758,
        updatedAt: new Date().toISOString(),
      },
    ];

    return of(data).pipe(delay(450));
  }
}
