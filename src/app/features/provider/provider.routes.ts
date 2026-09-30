import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role-guard';
import { ProviderShell } from '../../core/layouts/provider-shell/provider-shell';

export const PROVIDER_ROUTES: Routes = [
  {
    path: 'register-business',
    loadComponent: () =>
      import('./pages/register-business/register-business').then(
        (m) => m.RegisterBusiness
      ),
  },
  {
    path: '',
    canActivate: [roleGuard],
    data: { role: 'provider' },
    component: ProviderShell,
    children: [
      {
        path: 'await-verification',
        loadComponent: () =>
          import('./pages/await-verification/await-verification').then(
            (m) => m.AwaitVerification
          ),
      },
      {
        path: 'verification-result',
        loadComponent: () =>
          import('./pages/verification-result/verification-result').then(
            (m) => m.VerificationResult
          ),
      },
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then((m) => m.Login),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'slots/category',
        loadComponent: () =>
          import('./pages/select-category/select-category').then(
            (m) => m.SelectCategory
          ),
      },
      {
        path: 'slots/details',
        loadComponent: () =>
          import('./pages/enter-slot-details/enter-slot-details').then(
            (m) => m.EnterSlotDetails
          ),
      },
      {
        path: 'slots/publish',
        loadComponent: () =>
          import('./pages/publish-slot/publish-slot').then((m) => m.PublishSlot),
      },
      {
        path: 'slots/manage',
        loadComponent: () =>
          import('./pages/my-slots/my-slots').then((m) => m.MySlots),
      },
      {
        path: 'bookings/list',
        loadComponent: () =>
          import('./pages/bookings-list/bookings-list').then((m) => m.BookingsList),
      },
      {
        path: 'bookings/status',
        loadComponent: () =>
          import('./pages/update-booking-status/update-booking-status').then(
            (m) => m.UpdateBookingStatus
          ),
      },
      {
        path: 'payments/table',
        loadComponent: () =>
          import('./pages/payment-table/payment-table').then((m) => m.PaymentTable),
      },
      {
        path: 'ledger',
        loadComponent: () =>
          import('./pages/ledger/ledger').then((m) => m.Ledger),
      },
      {
        path: 'payments/export',
        loadComponent: () =>
          import('./pages/export-summary/export-summary').then((m) => m.ExportSummary),
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
      },
      {
        path: 'logout',
        loadComponent: () => import('./pages/logout/logout').then((m) => m.Logout),
      },
      {
        path: '',
        redirectTo: 'register-business',
        pathMatch: 'full',
      },
    ],
  },
];
