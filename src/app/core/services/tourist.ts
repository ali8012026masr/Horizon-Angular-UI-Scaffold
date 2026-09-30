import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TouristResponse, UpdateTouristRequest } from '../../models/tourist.model';

@Injectable({ providedIn: 'root' })
export class TouristService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tourists`;

  getById(id: string): Observable<TouristResponse> {
    return this.http.get<TouristResponse>(`${this.baseUrl}/${id}`);
  }

  update(id: string, request: UpdateTouristRequest): Observable<TouristResponse> {
    return this.http.put<TouristResponse>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
