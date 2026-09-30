import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { PendingRegistration, RoleUser, CommissionRow, ProviderLedgerRow, ReportSummary } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminDataService {
  private readonly registrations: PendingRegistration[] = [
    {
      id: 'PR-201',
      applicantName: 'Horizon Tours Ltd.',
      applicantType: 'Service Provider',
      submittedAt: new Date(Date.now() - 86400000).toISOString(),
      status: 'Pending',
      details: 'Hotel and transport service provider waiting for trade license verification.',
    },
    {
      id: 'PR-202',
      applicantName: 'Zamal Uddin',
      applicantType: 'Tour Guide',
      submittedAt: new Date(Date.now() - 129600000).toISOString(),
      status: 'Pending',
      details: 'Experienced guide in coastal routes with valid national ID.',
    },
    {
      id: 'PR-203',
      applicantName: 'Sylhet Highland Tours',
      applicantType: 'Service Provider',
      submittedAt: new Date(Date.now() - 172800000).toISOString(),
      status: 'Pending',
      details: 'Micro-bus and resort operator awaiting document verification.',
    },
    {
      id: 'PR-204',
      applicantName: 'Farhan Chowdhury',
      applicantType: 'Tour Guide',
      submittedAt: new Date(Date.now() - 216000000).toISOString(),
      status: 'Pending',
      details: 'Island tour specialist requesting guide account approval.',
    },
    {
      id: 'PR-205',
      applicantName: 'Rangamati Lake Cruises',
      applicantType: 'Service Provider',
      submittedAt: new Date(Date.now() - 259200000).toISOString(),
      status: 'Pending',
      details: 'Launch service provider submitting trade license for review.',
    },
    {
      id: 'PR-206',
      applicantName: 'Nusrat Jahan',
      applicantType: 'Tour Guide',
      submittedAt: new Date(Date.now() - 302400000).toISOString(),
      status: 'Pending',
      details: 'Hill-tract guide with references from prior tour operators.',
    },
    {
      id: 'PR-207',
      applicantName: 'Bandarban Adventure Co.',
      applicantType: 'Service Provider',
      submittedAt: new Date(Date.now() - 345600000).toISOString(),
      status: 'Pending',
      details: 'Amusement park operator awaiting safety certificate check.',
    },
  ];

  private readonly users: RoleUser[] = [
    {
      id: 'U-301',
      name: 'John Doe',
      role: 'tourist',
      status: 'Active',
      email: 'tourist@horizon.app',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'U-302',
      name: 'Asif Rahman',
      role: 'provider',
      status: 'Active',
      email: 'provider@horizon.app',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'U-303',
      name: 'Zamal Uddin',
      role: 'guide',
      status: 'Active',
      email: 'guide@horizon.app',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'U-304',
      name: 'Farhan Chowdhury',
      role: 'tourist',
      status: 'Active',
      email: 'farhan@horizon.app',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'U-305',
      name: 'Sea Pearl Stay',
      role: 'provider',
      status: 'Suspended',
      email: 'seapearl@horizon.app',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'U-306',
      name: 'Minhaj Karim',
      role: 'guide',
      status: 'Active',
      email: 'minhaj@horizon.app',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'U-307',
      name: 'Nusrat Jahan',
      role: 'tourist',
      status: 'Revoked',
      email: 'nusrat@horizon.app',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'U-308',
      name: 'Horizon Admin',
      role: 'admin',
      status: 'Active',
      email: 'admin@horizon.app',
      createdAt: new Date().toISOString(),
    },
  ];

  private readonly commissionRows: CommissionRow[] = [
    {
      id: 'C-401',
      serviceCategory: 'Bus',
      transactionDate: new Date(Date.now() - 86400000).toISOString(),
      amount: 1800,
      commissionPercent: 10,
      commissionAmount: 180,
    },
    {
      id: 'C-402',
      serviceCategory: 'Hotel',
      transactionDate: new Date(Date.now() - 172800000).toISOString(),
      amount: 5500,
      commissionPercent: 12,
      commissionAmount: 660,
    },
    {
      id: 'C-403',
      serviceCategory: 'Ship',
      transactionDate: new Date(Date.now() - 259200000).toISOString(),
      amount: 2500,
      commissionPercent: 8,
      commissionAmount: 200,
    },
    {
      id: 'C-404',
      serviceCategory: 'Amusement Park',
      transactionDate: new Date(Date.now() - 345600000).toISOString(),
      amount: 3000,
      commissionPercent: 10,
      commissionAmount: 300,
    },
    {
      id: 'C-405',
      serviceCategory: 'Train',
      transactionDate: new Date(Date.now() - 432000000).toISOString(),
      amount: 900,
      commissionPercent: 5,
      commissionAmount: 45,
    },
    {
      id: 'C-406',
      serviceCategory: 'Resort',
      transactionDate: new Date(Date.now() - 518400000).toISOString(),
      amount: 6200,
      commissionPercent: 12,
      commissionAmount: 744,
    },
    {
      id: 'C-407',
      serviceCategory: 'Micro-bus',
      transactionDate: new Date(Date.now() - 604800000).toISOString(),
      amount: 1200,
      commissionPercent: 10,
      commissionAmount: 120,
    },
  ];

  private readonly ledgerRows: ProviderLedgerRow[] = [
    {
      id: 'L-501',
      providerName: 'Dhaka Express',
      serviceCategory: 'Bus',
      amount: 1800,
      settlementDate: new Date(Date.now() - 86400000).toISOString(),
      status: 'Settled',
    },
    {
      id: 'L-502',
      providerName: 'Sea Pearl Stay',
      serviceCategory: 'Hotel',
      amount: 5500,
      settlementDate: new Date().toISOString(),
      status: 'Pending',
    },
    {
      id: 'L-503',
      providerName: 'MV Sea Breeze',
      serviceCategory: 'Ship',
      amount: 2500,
      settlementDate: new Date(Date.now() - 259200000).toISOString(),
      status: 'Settled',
    },
    {
      id: 'L-504',
      providerName: 'Sajek Valley Adventure Park',
      serviceCategory: 'Amusement Park',
      amount: 3000,
      settlementDate: new Date().toISOString(),
      status: 'Pending',
    },
    {
      id: 'L-505',
      providerName: 'Sylhet Rail Link',
      serviceCategory: 'Train',
      amount: 900,
      settlementDate: new Date(Date.now() - 432000000).toISOString(),
      status: 'Settled',
    },
    {
      id: 'L-506',
      providerName: "Cox's Bazar Resort",
      serviceCategory: 'Resort',
      amount: 6200,
      settlementDate: new Date().toISOString(),
      status: 'Pending',
    },
    {
      id: 'L-507',
      providerName: 'Dhaka Chittagong Micro',
      serviceCategory: 'Micro-bus',
      amount: 1200,
      settlementDate: new Date(Date.now() - 604800000).toISOString(),
      status: 'Settled',
    },
  ];

  getPendingRegistrations(): Observable<PendingRegistration[]> {
    return of(this.registrations).pipe(delay(300));
  }

  approveRegistration(id: string): Observable<void> {
    const registration = this.registrations.find((entry) => entry.id === id);
    if (registration) {
      registration.status = 'Approved';
    }
    return of(void 0).pipe(delay(200));
  }

  rejectRegistration(id: string): Observable<void> {
    const registration = this.registrations.find((entry) => entry.id === id);
    if (registration) {
      registration.status = 'Rejected';
    }
    return of(void 0).pipe(delay(200));
  }

  getUsers(): Observable<RoleUser[]> {
    return of(this.users).pipe(delay(250));
  }

  updateUserStatus(id: string, status: 'Active' | 'Suspended' | 'Revoked'): Observable<void> {
    const user = this.users.find((entry) => entry.id === id);
    if (user) {
      user.status = status;
    }
    return of(void 0).pipe(delay(200));
  }

  getCommissionRows(): Observable<CommissionRow[]> {
    return of(this.commissionRows).pipe(delay(250));
  }

  getLedgerRows(): Observable<ProviderLedgerRow[]> {
    return of(this.ledgerRows).pipe(delay(250));
  }

  getReportSummary(): Observable<ReportSummary[]> {
    const summary: ReportSummary[] = [
      { name: 'Total Revenue', value: '₺152,400', note: 'This month' },
      { name: 'Bookings Completed', value: '128', note: 'Across services' },
      { name: 'Commission Collected', value: '₺13,680', note: 'Platform share' },
    ];
    return of(summary).pipe(delay(300));
  }
}
