import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateServiceSlotRequest,
  RawServiceSlotResponse,
  ServiceSlotResponse,
  ServiceSlotSearchRequest,
  UpdateServiceSlotRequest,
} from '../../models/service-slot.model';

function buildParams(request: ServiceSlotSearchRequest): HttpParams {
  let params = new HttpParams();
  Object.entries(request).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params = params.set(key, String(value));
    }
  });
  return params;
}

function toSlotResponse(raw: RawServiceSlotResponse): ServiceSlotResponse {
  return {
    id: raw.id,
    providerId: raw.providerId,
    providerName: raw.providerBusinessName,
    category: raw.category,
    origin: raw.origin,
    destination: raw.destination,
    locationName: raw.locationName,
    startAt: raw.startDateTime,
    endAt: raw.endDateTime,
    capacity: raw.capacity,
    availableSeats: raw.availableSeats,
    price: raw.price,
    status: raw.status,
    providerRatingAvg: raw.providerRatingAvg,
    providerRatingCount: raw.providerRatingCount,
  };
}

@Injectable({ providedIn: 'root' })
export class ServiceSlotService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/slots`;

  create(request: CreateServiceSlotRequest): Observable<ServiceSlotResponse> {
    return this.http
      .post<RawServiceSlotResponse>(this.baseUrl, {
        providerId: request.providerId,
        category: request.category,
        origin: request.origin,
        destination: request.destination,
        locationName: request.locationName,
        startDateTime: request.startAt,
        endDateTime: request.endAt,
        capacity: request.capacity,
        price: request.price,
      })
      .pipe(map(toSlotResponse));
  }

  update(id: string, request: UpdateServiceSlotRequest): Observable<ServiceSlotResponse> {
    return this.http
      .put<RawServiceSlotResponse>(`${this.baseUrl}/${id}`, {
        origin: request.origin,
        destination: request.destination,
        locationName: request.locationName,
        startDateTime: request.startAt,
        endDateTime: request.endAt,
        capacity: request.capacity,
        price: request.price,
      })
      .pipe(map(toSlotResponse));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getById(id: string): Observable<ServiceSlotResponse> {
    return this.http.get<RawServiceSlotResponse>(`${this.baseUrl}/${id}`).pipe(map(toSlotResponse));
  }

  search(request: ServiceSlotSearchRequest): Observable<ServiceSlotResponse[]> {
    return this.http
      .get<RawServiceSlotResponse[]>(`${this.baseUrl}/search`, { params: buildParams(request) })
      .pipe(map((rows) => rows.map(toSlotResponse)));
  }

  listByProvider(providerId: string): Observable<ServiceSlotResponse[]> {
    return this.http
      .get<RawServiceSlotResponse[]>(`${this.baseUrl}/provider/${providerId}`)
      .pipe(map((rows) => rows.map(toSlotResponse)));
  }
}
