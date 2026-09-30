import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LocationResponse, UpdateLocationRequest } from '../../models/location.model';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/guides`;

  updateLocation(guideId: string, request: UpdateLocationRequest): Observable<LocationResponse> {
    return this.http.put<LocationResponse>(`${this.baseUrl}/${guideId}/location`, request);
  }

  getLocation(guideId: string): Observable<LocationResponse> {
    return this.http.get<LocationResponse>(`${this.baseUrl}/${guideId}/location`);
  }
}
