import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BookingResponse,
  BookingStatus,
  CreateBookingRequest,
  RawBookingResponse,
} from '../../models/booking.model';

function toBookingResponse(raw: RawBookingResponse): BookingResponse {
  return {
    id: raw.id,
    slotId: raw.serviceSlotId,
    touristId: raw.touristId,
    status: raw.status,
    paymentStatus: raw.paymentStatus,
    amount: raw.totalAmount,
    bookedAt: raw.bookingDate,
  };
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/bookings`;

  create(request: CreateBookingRequest): Observable<BookingResponse> {
    return this.http
      .post<RawBookingResponse>(this.baseUrl, {
        touristId: request.touristId,
        serviceSlotId: request.slotId,
      })
      .pipe(map(toBookingResponse));
  }

  listByTourist(touristId: string): Observable<BookingResponse[]> {
    return this.http
      .get<RawBookingResponse[]>(`${this.baseUrl}/tourist/${touristId}`)
      .pipe(map((rows) => rows.map(toBookingResponse)));
  }

  listByProvider(providerId: string): Observable<BookingResponse[]> {
    return this.http
      .get<RawBookingResponse[]>(`${this.baseUrl}/provider/${providerId}`)
      .pipe(map((rows) => rows.map(toBookingResponse)));
  }

  updateStatus(id: string, status: BookingStatus): Observable<BookingResponse> {
    return this.http
      .put<RawBookingResponse>(`${this.baseUrl}/${id}/status`, { status })
      .pipe(map(toBookingResponse));
  }
}
