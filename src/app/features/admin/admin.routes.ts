import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role-guard';
import { AdminShell } from '../../core/layouts/admin-shell/admin-shell';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: { role: 'admin' },
    component: AdminShell,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then((m) => m.Login),
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'pending-registrations',
        loadComponent: () => import('./pages/pending-registrations/pending-registrations').then((m) => m.PendingRegistrations),
      },
      {
        path: 'role-management',
        loadComponent: () => import('./pages/role-management/role-management').then((m) => m.RoleManagement),
      },
      {
        path: 'commission',
        loadComponent: () => import('./pages/commission/commission').then((m) => m.Commission),
      },
      {
        path: 'ledger',
        loadComponent: () => import('./pages/ledger/ledger').then((m) => m.Ledger),
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/reports/reports').then((m) => m.Reports),
      },
      {
        path: 'logout',
        loadComponent: () => import('./pages/logout/logout').then((m) => m.Logout),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
];
