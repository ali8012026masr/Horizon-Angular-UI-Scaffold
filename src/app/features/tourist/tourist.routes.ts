import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role-guard';
import { TouristShell } from '../../core/layouts/tourist-shell/tourist-shell';

export const TOURIST_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: { role: 'tourist' },
    component: TouristShell,
    children: [
      {
        path: 'auth',
        loadComponent: () =>
          import('./pages/auth-gateway/auth-gateway').then((m) => m.AuthGateway),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'slots',
        loadComponent: () =>
          import('./pages/browse-slots/browse-slots').then((m) => m.BrowseSlots),
      },
      {
        path: 'slots/:id',
        loadComponent: () =>
          import('./pages/select-slot/select-slot').then((m) => m.SelectSlot),
      },
      {
        path: 'cart',
        loadComponent: () => import('./pages/cart/cart').then((m) => m.Cart),
      },
      {
        path: 'payment/:id',
        loadComponent: () => import('./pages/payment/payment').then((m) => m.Payment),
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./pages/my-bookings/my-bookings').then((m) => m.MyBookings),
      },
      {
        path: 'booking-confirmation',
        loadComponent: () =>
          import('./pages/booking-confirmation/booking-confirmation').then(
            (m) => m.BookingConfirmation
          ),
      },
      {
        path: 'guides',
        loadComponent: () =>
          import('./pages/browse-guides/browse-guides').then((m) => m.BrowseGuides),
      },
      {
        path: 'guides/:id',
        loadComponent: () =>
          import('./pages/select-guide/select-guide').then((m) => m.SelectGuide),
      },
      {
        path: 'guides/request/:id',
        loadComponent: () =>
          import('./pages/request-guide/request-guide').then((m) => m.RequestGuide),
      },
      {
        path: 'group/create',
        loadComponent: () =>
          import('./pages/create-group/create-group').then((m) => m.CreateGroup),
      },
      {
        path: 'group/my',
        loadComponent: () =>
          import('./pages/my-groups/my-groups').then((m) => m.MyGroups),
      },
      {
        path: 'group/booking',
        loadComponent: () =>
          import('./pages/group-booking/group-booking').then((m) => m.GroupBooking),
      },
      {
        path: 'group/join',
        loadComponent: () =>
          import('./pages/group-join/group-join').then((m) => m.GroupJoin),
      },
      {
        path: 'tracking/live',
        loadComponent: () =>
          import('./pages/view-location/view-location').then((m) => m.ViewLocation),
      },
      {
        path: 'ratings',
        loadComponent: () =>
          import('./pages/rate-services/rate-services').then((m) => m.RateServices),
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
        redirectTo: 'auth',
        pathMatch: 'full',
      },
    ],
  },
];
