import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreatePaymentRequest, PaymentResponse, PaymentTxStatus } from '../../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/payments`;

  create(request: CreatePaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(this.baseUrl, request);
  }

  getById(id: string): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${this.baseUrl}/${id}`);
  }

  getByBooking(bookingId: string): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${this.baseUrl}/booking/${bookingId}`);
  }

  updateStatus(id: string, status: PaymentTxStatus): Observable<PaymentResponse> {
    return this.http.put<PaymentResponse>(`${this.baseUrl}/${id}/status`, { status });
  }
}
