import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role-guard';
import { GuideShell } from '../../core/layouts/guide-shell/guide-shell';

export const GUIDE_ROUTES: Routes = [
  {
    path: 'apply',
    loadComponent: () => import('./pages/apply/apply').then((m) => m.ApplyGuide),
  },
  {
    path: '',
    canActivate: [roleGuard],
    data: { role: 'guide' },
    component: GuideShell,
    children: [
      {
        path: 'await-verification',
        loadComponent: () => import('./pages/await-verification/await-verification').then((m) => m.AwaitVerification),
      },
      {
        path: 'verification-result',
        loadComponent: () => import('./pages/verification-result/verification-result').then((m) => m.VerificationResult),
      },
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then((m) => m.Login),
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'schedule/post',
        loadComponent: () => import('./pages/post-schedule/post-schedule').then((m) => m.PostSchedule),
      },
      {
        path: 'bookings',
        loadComponent: () => import('./pages/bookings/bookings').then((m) => m.Bookings),
      },
      {
        path: 'conduct',
        loadComponent: () => import('./pages/conduct-tour/conduct-tour').then((m) => m.ConductTour),
      },
      {
        path: 'ratings',
        loadComponent: () => import('./pages/ratings/ratings').then((m) => m.Ratings),
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
        redirectTo: 'apply',
        pathMatch: 'full',
      },
    ],
  },
];
