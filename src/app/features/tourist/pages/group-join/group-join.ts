import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, interval, of, startWith, switchMap } from 'rxjs';
import { AuthService } from '../../../../core/services/auth';
import { GroupService } from '../../../../core/services/group';
import { GroupMessageService } from '../../../../core/services/group-message';
import { ApiError } from '../../../../models/api-error.model';
import { GroupMemberResponse, GroupResponse } from '../../../../models/group.model';
import { GroupMessageResponse } from '../../../../models/group-message.model';

const MESSAGE_POLL_INTERVAL_MS = 5000;

@Component({
  selector: 'app-group-join',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './group-join.html',
  styleUrl: './group-join.scss',
})
export class GroupJoin {
  private readonly fb = inject(FormBuilder);
  private readonly groupService = inject(GroupService);
  private readonly groupMessageService = inject(GroupMessageService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly group = signal<GroupResponse | null>(null);
  readonly payingId = signal<string | null>(null);

  readonly messages = signal<GroupMessageResponse[]>([]);
  readonly messageError = signal('');
  readonly sendingMessage = signal(false);
  readonly messageForm = this.fb.nonNullable.group({
    text: ['', Validators.required],
  });

  readonly currentTouristId = this.authService.currentUser().id;

  readonly form = this.fb.nonNullable.group({
    joinCode: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    const groupId = this.route.snapshot.queryParamMap.get('groupId');
    if (groupId) {
      this.loading.set(true);
      this.groupService
        .getById(groupId)
        .pipe(
          catchError((error: ApiError) => {
            this.error.set(error.message || 'Unable to load group.');
            return of(null);
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe((response) => {
          this.loading.set(false);
          if (response) {
            this.group.set(response);
          }
        });
    }

    effect(() => {
      const group = this.group();
      if (group) {
        this.startMessagePolling(group.id);
      }
    });
  }

  private startMessagePolling(groupId: string): void {
    interval(MESSAGE_POLL_INTERVAL_MS)
      .pipe(
        startWith(0),
        switchMap(() =>
          this.groupMessageService.listByGroup(groupId).pipe(
            catchError((error: ApiError) => {
              this.messageError.set(error.message || 'Unable to load messages.');
              return of(null);
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((messages) => {
        if (!messages) {
          return;
        }
        this.messageError.set('');
        this.messages.set(messages);
      });
  }

  sendMessage(): void {
    const group = this.group();
    if (!group || this.messageForm.invalid) {
      this.messageForm.markAllAsTouched();
      return;
    }

    const text = this.messageForm.getRawValue().text.trim();
    if (!text) {
      return;
    }

    this.sendingMessage.set(true);
    this.groupMessageService
      .send(group.id, { touristId: this.currentTouristId, message: text })
      .pipe(
        catchError((error: ApiError) => {
          this.messageError.set(error.message || 'Unable to send message.');
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((sent) => {
        this.sendingMessage.set(false);
        if (sent) {
          this.messages.update((current) => [...current, sent]);
          this.messageForm.reset({ text: '' });
        }
      });
  }

  join(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.groupService
      .joinByCode({
        joinCode: this.form.getRawValue().joinCode.toUpperCase(),
        touristId: this.authService.currentUser().id,
      })
      .pipe(
        catchError((error: ApiError) => {
          this.error.set(error.message || 'Unable to join group.');
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response) => {
        this.loading.set(false);
        if (!response) {
          return;
        }
        this.group.set(response);
      });
  }

  pay(member: GroupMemberResponse): void {
    const group = this.group();
    if (!group) {
      return;
    }
    this.payingId.set(member.id);
    this.groupService
      .markPaid(group.id, member.touristId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.payingId.set(null);
          this.group.update((current) =>
            current
              ? {
                  ...current,
                  members: current.members.map((m) => (m.id === member.id ? { ...m, paid: true } : m)),
                }
              : current
          );
        },
        error: () => {
          this.payingId.set(null);
        },
      });
  }
}
