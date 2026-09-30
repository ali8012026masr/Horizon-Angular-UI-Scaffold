import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CommissionResponse } from '../../models/commission.model';
import { ProviderResponse, UpdateProviderRequest } from '../../models/provider.model';

@Injectable({ providedIn: 'root' })
export class ProviderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/providers`;

  getById(id: string): Observable<ProviderResponse> {
    return this.http.get<ProviderResponse>(`${this.baseUrl}/${id}`);
  }

  update(id: string, request: UpdateProviderRequest): Observable<ProviderResponse> {
    return this.http.put<ProviderResponse>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  listCommissions(id: string): Observable<CommissionResponse[]> {
    return this.http.get<CommissionResponse[]>(`${this.baseUrl}/${id}/commissions`);
  }
}
