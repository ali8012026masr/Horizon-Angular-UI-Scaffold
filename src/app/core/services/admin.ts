import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminUserResponse, UpdateUserStatusRequest, UserStatus } from '../../models/user.model';
import { CommissionResponse, CommissionSearchRequest } from '../../models/commission.model';
import { PaymentResponse, PaymentSearchRequest } from '../../models/payment.model';
import { ProviderResponse } from '../../models/provider.model';
import { GuideResponse } from '../../models/guide.model';
import {
  BookingsSummaryResponse,
  CommissionSummaryResponse,
  RevenueSummaryResponse,
} from '../../models/admin-reports.model';

function toParams(request: object): HttpParams {
  let params = new HttpParams();
  Object.entries(request).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params = params.set(key, String(value));
    }
  });
  return params;
}

export interface PendingRegistrationsResponse {
  providers: ProviderResponse[];
  guides: GuideResponse[];
}

export interface VerifyRequest {
  approved: boolean;
  rejectionReason?: string;
}

export interface UserListFilters {
  role?: string;
  status?: UserStatus;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin`;

  getPendingRegistrations(): Observable<PendingRegistrationsResponse> {
    return this.http.get<PendingRegistrationsResponse>(`${this.baseUrl}/pending-registrations`);
  }

  verifyProvider(id: string, request: VerifyRequest): Observable<ProviderResponse> {
    return this.http.put<ProviderResponse>(`${this.baseUrl}/providers/${id}/verify`, request);
  }

  verifyGuide(id: string, request: VerifyRequest): Observable<GuideResponse> {
    return this.http.put<GuideResponse>(`${this.baseUrl}/guides/${id}/verify`, request);
  }

  listUsers(filters: UserListFilters): Observable<AdminUserResponse[]> {
    return this.http.get<AdminUserResponse[]>(`${this.baseUrl}/users`, { params: toParams(filters) });
  }

  updateUserStatus(id: string, request: UpdateUserStatusRequest): Observable<AdminUserResponse> {
    return this.http.put<AdminUserResponse>(`${this.baseUrl}/users/${id}/status`, request);
  }

  listPayments(filters: PaymentSearchRequest): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${this.baseUrl}/payments`, { params: toParams(filters) });
  }

  listCommissions(filters: CommissionSearchRequest): Observable<CommissionResponse[]> {
    return this.http.get<CommissionResponse[]>(`${this.baseUrl}/commissions`, { params: toParams(filters) });
  }

  settleCommission(id: string): Observable<CommissionResponse> {
    return this.http.put<CommissionResponse>(`${this.baseUrl}/commissions/${id}/settle`, {});
  }

  getRevenueSummary(dateFrom?: string, dateTo?: string): Observable<RevenueSummaryResponse> {
    return this.http.get<RevenueSummaryResponse>(`${this.baseUrl}/reports/revenue-summary`, {
      params: toParams({ dateFrom, dateTo }),
    });
  }

  getBookingsSummary(dateFrom?: string, dateTo?: string): Observable<BookingsSummaryResponse> {
    return this.http.get<BookingsSummaryResponse>(`${this.baseUrl}/reports/bookings-summary`, {
      params: toParams({ dateFrom, dateTo }),
    });
  }

  getCommissionSummary(dateFrom?: string, dateTo?: string): Observable<CommissionSummaryResponse> {
    return this.http.get<CommissionSummaryResponse>(`${this.baseUrl}/reports/commission-summary`, {
      params: toParams({ dateFrom, dateTo }),
    });
  }
}
