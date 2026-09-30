import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateGuideBookingRequest,
  GuideBookingResponse,
  GuideBookingStatus,
} from '../../models/guide-booking.model';

@Injectable({ providedIn: 'root' })
export class GuideBookingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/guide-bookings`;

  create(request: CreateGuideBookingRequest): Observable<GuideBookingResponse> {
    return this.http.post<GuideBookingResponse>(this.baseUrl, request);
  }

  listByGuide(guideId: string): Observable<GuideBookingResponse[]> {
    return this.http.get<GuideBookingResponse[]>(`${this.baseUrl}/guide/${guideId}`);
  }

  listByTourist(touristId: string): Observable<GuideBookingResponse[]> {
    return this.http.get<GuideBookingResponse[]>(`${this.baseUrl}/tourist/${touristId}`);
  }

  updateStatus(id: string, status: GuideBookingStatus): Observable<GuideBookingResponse> {
    return this.http.put<GuideBookingResponse>(`${this.baseUrl}/${id}/status`, { status });
  }

  markPaymentReceived(id: string): Observable<GuideBookingResponse> {
    return this.http.put<GuideBookingResponse>(`${this.baseUrl}/${id}/payment-received`, {});
  }
}
