import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateGuideAvailabilityRequest,
  GuideAvailabilityResponse,
  GuideAvailabilitySearchRequest,
} from '../../models/guide-availability.model';

function buildParams(request: GuideAvailabilitySearchRequest): HttpParams {
  let params = new HttpParams();
  Object.entries(request).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params = params.set(key, String(value));
    }
  });
  return params;
}

@Injectable({ providedIn: 'root' })
export class GuideAvailabilityService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/guide-availability`;

  create(request: CreateGuideAvailabilityRequest): Observable<GuideAvailabilityResponse> {
    return this.http.post<GuideAvailabilityResponse>(this.baseUrl, request);
  }

  update(id: string, request: Partial<CreateGuideAvailabilityRequest>): Observable<GuideAvailabilityResponse> {
    return this.http.put<GuideAvailabilityResponse>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  search(request: GuideAvailabilitySearchRequest): Observable<GuideAvailabilityResponse[]> {
    return this.http.get<GuideAvailabilityResponse[]>(`${this.baseUrl}/search`, {
      params: buildParams(request),
    });
  }

  listByGuide(guideId: string): Observable<GuideAvailabilityResponse[]> {
    return this.http.get<GuideAvailabilityResponse[]>(`${this.baseUrl}/guide/${guideId}`);
  }
}
