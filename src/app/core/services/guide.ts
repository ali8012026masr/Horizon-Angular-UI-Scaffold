import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GuideResponse, UpdateGuideRequest } from '../../models/guide.model';

@Injectable({ providedIn: 'root' })
export class GuideService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/guides`;

  getById(id: string): Observable<GuideResponse> {
    return this.http.get<GuideResponse>(`${this.baseUrl}/${id}`);
  }

  update(id: string, request: UpdateGuideRequest): Observable<GuideResponse> {
    return this.http.put<GuideResponse>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  listAvailable(): Observable<GuideResponse[]> {
    const params = new HttpParams().set('available', 'true');
    return this.http.get<GuideResponse[]>(this.baseUrl, { params });
  }
}
