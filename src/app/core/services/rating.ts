import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateGuideRatingRequest,
  CreateServiceRatingRequest,
  GuideRatingResponse,
  ServiceRatingResponse,
} from '../../models/rating.model';

@Injectable({ providedIn: 'root' })
export class RatingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/ratings`;

  rateGuide(request: CreateGuideRatingRequest): Observable<GuideRatingResponse> {
    return this.http.post<GuideRatingResponse>(`${this.baseUrl}/guide`, request);
  }

  getGuideRatings(guideId: string): Observable<GuideRatingResponse[]> {
    return this.http.get<GuideRatingResponse[]>(`${this.baseUrl}/guide/${guideId}`);
  }

  rateService(request: CreateServiceRatingRequest): Observable<ServiceRatingResponse> {
    return this.http.post<ServiceRatingResponse>(`${this.baseUrl}/service`, request);
  }

  getProviderRatings(providerId: string): Observable<ServiceRatingResponse[]> {
    return this.http.get<ServiceRatingResponse[]>(`${this.baseUrl}/provider/${providerId}`);
  }
}
