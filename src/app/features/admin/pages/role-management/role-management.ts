import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { AdminService } from '../../../../core/services/admin';
import { RoleUser } from '../../../../models/admin.model';
import { UserStatus } from '../../../../models/user.model';
import { ApiError } from '../../../../models/api-error.model';

const STATUS_TO_UI: Record<UserStatus, RoleUser['status']> = {
  ACTIVE: 'Active',
  PENDING_VERIFICATION: 'Active',
  SUSPENDED: 'Suspended',
  REVOKED: 'Revoked',
};

const UI_TO_STATUS: Record<RoleUser['status'], UserStatus> = {
  Active: 'ACTIVE',
  Suspended: 'SUSPENDED',
  Revoked: 'REVOKED',
};

@Component({
  selector: 'app-role-management',
  imports: [],
  templateUrl: './role-management.html',
  styleUrl: './role-management.scss',
})
export class RoleManagement {
  private readonly adminService = inject(AdminService);
  private readonly destroyRef = inject(DestroyRef);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly users = signal<RoleUser[]>([]);

  constructor() {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.error.set('');
    this.adminService
      .listUsers({})
      .pipe(
        map((users) =>
          users.map((user) => ({
            id: user.id,
            name: user.fullName,
            role: user.role.toLowerCase() as RoleUser['role'],
            status: STATUS_TO_UI[user.status],
            email: user.email,
            createdAt: user.createdAt,
          }))
        ),
        catchError((error: ApiError) => {
          this.error.set(error.message);
          return of([]);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((users) => {
        this.users.set(users);
        this.loading.set(false);
      });
  }

  updateStatus(id: string, status: 'Active' | 'Suspended' | 'Revoked'): void {
    this.adminService
      .updateUserStatus(id, { status: UI_TO_STATUS[status] })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadUsers());
  }
}
