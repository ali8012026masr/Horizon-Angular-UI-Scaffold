import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Observable, catchError, map, of } from 'rxjs';
import { AdminService } from '../../../../core/services/admin';
import { ProviderResponse } from '../../../../models/provider.model';
import { GuideResponse } from '../../../../models/guide.model';
import { PendingRegistration, RegistrationField } from '../../../../models/admin.model';
import { ApiError } from '../../../../models/api-error.model';

@Component({
  selector: 'app-pending-registrations',
  imports: [DatePipe],
  templateUrl: './pending-registrations.html',
  styleUrl: './pending-registrations.scss',
})
export class PendingRegistrations {
  private readonly adminService = inject(AdminService);
  private readonly destroyRef = inject(DestroyRef);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly registrations = signal<PendingRegistration[]>([]);
  readonly activeDetailsId = signal<string | null>(null);

  constructor() {
    this.loadRegistrations();
  }

  private loadRegistrations(): void {
    this.loading.set(true);
    this.error.set('');
    this.adminService
      .getPendingRegistrations()
      .pipe(
        map((result) => [
          ...result.providers.map((provider) => this.fromProvider(provider)),
          ...result.guides.map((guide) => this.fromGuide(guide)),
        ]),
        catchError((error: ApiError) => {
          this.error.set(error.message);
          return of([]);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((items) => {
        this.registrations.set(items);
        this.loading.set(false);
      });
  }

  private fromProvider(item: ProviderResponse): PendingRegistration {
    const fields: RegistrationField[] = [
      { label: 'Email', value: item.email },
      { label: 'Phone', value: item.phone ?? '—' },
      { label: 'Address', value: item.address ?? '—' },
      { label: 'Business name', value: item.businessName },
      { label: 'Trade license', value: item.tradeLicenseNo },
      { label: 'Category', value: item.category },
      { label: 'Commission rate', value: item.commissionRate ? `${item.commissionRate}%` : '—' },
      { label: 'Status', value: item.status },
      { label: 'Verification status', value: item.verificationStatus },
    ];

    return {
      id: item.id,
      applicantName: item.fullName,
      applicantType: 'Service Provider',
      submittedAt: undefined,
      status: this.normalizeStatus(item.verificationStatus),
      details: `${item.businessName} (${item.category})`,
      summary: `${item.businessName} is awaiting verification for ${item.category.toLowerCase()} services.`,
      fields,
    };
  }

  private fromGuide(item: GuideResponse): PendingRegistration {
    const fields: RegistrationField[] = [
      { label: 'Email', value: item.email },
      { label: 'Phone', value: item.phone ?? '—' },
      { label: 'Address', value: item.address ?? '—' },
      { label: 'National ID', value: item.nationalId ?? '—' },
      { label: 'Location', value: item.location },
      { label: 'Languages', value: item.languages?.length ? item.languages.join(', ') : '—' },
      { label: 'Experience', value: item.experienceYears ? `${item.experienceYears} years` : '—' },
      { label: 'Default price', value: item.defaultPrice ? `BDT ${item.defaultPrice}` : '—' },
      { label: 'Negotiable', value: item.negotiable ? 'Yes' : 'No' },
      { label: 'Bio', value: item.bio ?? '—' },
      { label: 'Rating', value: `${item.ratingAvg} (${item.ratingCount} reviews)` },
      { label: 'Availability', value: item.isAvailable ? 'Available' : 'Unavailable' },
    ];

    return {
      id: item.id,
      applicantName: item.fullName,
      applicantType: 'Tour Guide',
      submittedAt: undefined,
      status: this.normalizeStatus(item.verificationStatus),
      details: item.bio?.trim() || '',
      summary: item.bio?.trim() || 'Tour guide registration is waiting for admin review and document verification.',
      fields,
    };
  }

  isDetailsOpen(id: string): boolean {
    return this.activeDetailsId() === id;
  }

  selectedRegistration(): PendingRegistration | undefined {
    const id = this.activeDetailsId();
    return id ? this.registrations().find((registration) => registration.id === id) : undefined;
  }

  toggleDetails(id: string): void {
    this.activeDetailsId.set(this.isDetailsOpen(id) ? null : id);
  }

  closeDetails(): void {
    this.activeDetailsId.set(null);
  }

  formatFieldValue(value: RegistrationField['value']): string {
    if (value === null || value === undefined || value === '') {
      return '—';
    }

    if (Array.isArray(value)) {
      return value.length ? value.join(', ') : '—';
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    return String(value);
  }

  private normalizeStatus(status: string): 'Pending' | 'Approved' | 'Rejected' {
    if (status === 'APPROVED') {
      return 'Approved';
    }

    if (status === 'REJECTED') {
      return 'Rejected';
    }

    return 'Pending';
  }

  approve(id: string): void {
    const registration = this.registrations().find((entry) => entry.id === id);
    const verify$: Observable<unknown> =
      registration?.applicantType === 'Tour Guide'
        ? this.adminService.verifyGuide(id, { approved: true })
        : this.adminService.verifyProvider(id, { approved: true });

    verify$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.loadRegistrations());
  }

  reject(id: string): void {
    const registration = this.registrations().find((entry) => entry.id === id);
    const rejectionReason = 'Rejected by admin';
    const verify$: Observable<unknown> =
      registration?.applicantType === 'Tour Guide'
        ? this.adminService.verifyGuide(id, { approved: false, rejectionReason })
        : this.adminService.verifyProvider(id, { approved: false, rejectionReason });

    verify$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.loadRegistrations());
  }
}
