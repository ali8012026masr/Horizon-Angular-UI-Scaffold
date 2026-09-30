import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth';
import { GroupService } from '../../../../core/services/group';
import { ApiError } from '../../../../models/api-error.model';
import { GroupResponse } from '../../../../models/group.model';

@Component({
  selector: 'app-my-groups',
  imports: [DatePipe, RouterLink],
  templateUrl: './my-groups.html',
  styleUrl: './my-groups.scss',
})
export class MyGroups {
  private readonly groupService = inject(GroupService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly groups = signal<GroupResponse[]>([]);
  readonly copiedId = signal<string | null>(null);

  constructor() {
    this.groupService
      .listByTourist(this.authService.currentUser().id)
      .pipe(
        catchError((error: ApiError) => {
          this.error.set(error.message || 'Unable to load your groups.');
          return of([] as GroupResponse[]);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((groups) => {
        this.groups.set(groups);
        this.loading.set(false);
      });
  }

  copyCode(group: GroupResponse): void {
    navigator.clipboard?.writeText(group.joinCode).then(() => {
      this.copiedId.set(group.id);
      setTimeout(() => this.copiedId.set(null), 2000);
    });
  }
}
