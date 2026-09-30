import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth';
import { GroupService } from '../../../../core/services/group';
import { ApiError } from '../../../../models/api-error.model';

@Component({
  selector: 'app-create-group',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './create-group.html',
  styleUrl: './create-group.scss',
})
export class CreateGroup {
  private readonly fb = inject(FormBuilder);
  private readonly groupService = inject(GroupService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly created = signal(false);
  readonly joinCode = signal('');
  readonly groupId = signal('');
  readonly error = signal('');
  readonly form = this.fb.nonNullable.group({
    groupName: ['', [Validators.required, Validators.minLength(3)]],
  });

  create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { groupName } = this.form.getRawValue();
    this.groupService
      .create({ groupName, createdByTouristId: this.authService.currentUser().id })
      .pipe(
        catchError((error: ApiError) => {
          this.error.set(error.message || 'Unable to create group.');
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response) => {
        if (!response) {
          return;
        }
        this.error.set('');
        this.joinCode.set(response.joinCode);
        this.groupId.set(response.id);
        this.created.set(true);
      });
  }
}
