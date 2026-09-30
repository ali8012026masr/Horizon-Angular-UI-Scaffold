import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, interval, of, startWith, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';
import { NotificationResponse } from '../../../models/notification.model';

const POLL_INTERVAL_MS = 30000;

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './site-header.html',
  styleUrls: ['./site-header.scss'],
})
export class SiteHeader {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoggedIn = computed(() => !!this.authService.getAccessToken());
  readonly unreadCount = signal(0);
  readonly notifications = signal<NotificationResponse[]>([]);
  readonly panelOpen = signal(false);
  readonly loadingNotifications = signal(false);

  constructor() {
    interval(POLL_INTERVAL_MS)
      .pipe(
        startWith(0),
        switchMap(() => {
          if (!this.isLoggedIn()) {
            return of(null);
          }
          return this.notificationService.unreadCount(this.authService.currentUser().id).pipe(
            catchError(() => of(null))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((result) => {
        if (result) {
          this.unreadCount.set(result.count);
        }
      });
  }

  togglePanel(): void {
    this.panelOpen.update((open) => !open);
    if (this.panelOpen() && this.isLoggedIn()) {
      this.loadNotifications();
    }
  }

  private loadNotifications(): void {
    this.loadingNotifications.set(true);
    this.notificationService
      .listForUser(this.authService.currentUser().id)
      .pipe(
        catchError(() => of([] as NotificationResponse[])),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((notifications) => {
        this.notifications.set(notifications);
        this.loadingNotifications.set(false);
      });
  }

  select(notification: NotificationResponse): void {
    if (notification.read) {
      return;
    }
    this.notificationService
      .markRead(notification.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.notifications.update((current) =>
          current.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
        this.unreadCount.update((count) => Math.max(0, count - 1));
      });
  }
}
