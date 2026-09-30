import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { GuideBookingRequest, GuideRating } from '../models/guide.model';

@Injectable({ providedIn: 'root' })
export class GuideDataService {
  private readonly requests: GuideBookingRequest[] = [
    {
      id: 'GR-101',
      tourist: 'Rafi Ahmed',
      tourLocation: "Cox's Bazar",
      scheduledDate: new Date(Date.now() + 86_400_000).toISOString(),
      status: 'Pending',
      amount: 3500,
    },
    {
      id: 'GR-102',
      tourist: 'Amin Rahman',
      tourLocation: 'Sajek Valley',
      scheduledDate: new Date(Date.now() + 172_800_000).toISOString(),
      status: 'Pending',
      amount: 4200,
    },
    {
      id: 'GR-103',
      tourist: 'Farhan Chowdhury',
      tourLocation: "Saint Martin's Island",
      scheduledDate: new Date(Date.now() + 259_200_000).toISOString(),
      status: 'Accepted',
      amount: 3800,
    },
    {
      id: 'GR-104',
      tourist: 'Nusrat Jahan',
      tourLocation: 'Sylhet',
      scheduledDate: new Date(Date.now() + 345_600_000).toISOString(),
      status: 'Pending',
      amount: 3000,
    },
    {
      id: 'GR-105',
      tourist: 'Kamrul Islam',
      tourLocation: 'Bandarban',
      scheduledDate: new Date(Date.now() + 432_000_000).toISOString(),
      status: 'Declined',
      amount: 4000,
    },
    {
      id: 'GR-106',
      tourist: 'Sadia Afrin',
      tourLocation: "Cox's Bazar",
      scheduledDate: new Date(Date.now() + 518_400_000).toISOString(),
      status: 'Pending',
      amount: 3600,
    },
    {
      id: 'GR-107',
      tourist: 'Tanvir Hasan',
      tourLocation: 'Rangamati',
      scheduledDate: new Date(Date.now() + 604_800_000).toISOString(),
      status: 'Accepted',
      amount: 3200,
    },
  ];

  private readonly ratings: GuideRating[] = [
    {
      id: 'RR-501',
      tourist: 'Rafi Ahmed',
      score: 4.7,
      comment: 'Responsive guide with excellent local knowledge.',
      receivedAt: new Date(Date.now() - 2_592_000_000).toISOString(),
    },
    {
      id: 'RR-502',
      tourist: 'Farhan Chowdhury',
      score: 4.9,
      comment: 'Made the tour effortless and very enjoyable.',
      receivedAt: new Date(Date.now() - 5_184_000_000).toISOString(),
    },
    {
      id: 'RR-503',
      tourist: 'Nusrat Jahan',
      score: 4.5,
      comment: 'Good knowledge of trails, punctual pickup.',
      receivedAt: new Date(Date.now() - 7_776_000_000).toISOString(),
    },
    {
      id: 'RR-504',
      tourist: 'Kamrul Islam',
      score: 4.2,
      comment: 'Solid guide, could improve on English.',
      receivedAt: new Date(Date.now() - 10_368_000_000).toISOString(),
    },
    {
      id: 'RR-505',
      tourist: 'Sadia Afrin',
      score: 5.0,
      comment: 'Best guide we had on any trip so far.',
      receivedAt: new Date(Date.now() - 12_960_000_000).toISOString(),
    },
    {
      id: 'RR-506',
      tourist: 'Tanvir Hasan',
      score: 4.6,
      comment: 'Friendly and flexible with schedule changes.',
      receivedAt: new Date(Date.now() - 15_552_000_000).toISOString(),
    },
    {
      id: 'RR-507',
      tourist: 'Minhaj Karim',
      score: 4.8,
      comment: 'Great local food recommendations along route.',
      receivedAt: new Date(Date.now() - 18_144_000_000).toISOString(),
    },
  ];

  getBookingRequests(): Observable<GuideBookingRequest[]> {
    return of(this.requests).pipe(delay(300));
  }

  acceptRequest(requestId: string): Observable<void> {
    const request = this.requests.find((entry) => entry.id === requestId);
    if (request) {
      request.status = 'Accepted';
    }
    return of(void 0).pipe(delay(250));
  }

  declineRequest(requestId: string): Observable<void> {
    const request = this.requests.find((entry) => entry.id === requestId);
    if (request) {
      request.status = 'Declined';
    }
    return of(void 0).pipe(delay(250));
  }

  getRatings(): Observable<GuideRating[]> {
    return of(this.ratings).pipe(delay(250));
  }
}
