import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { GuideAvailabilityService } from '../../../../core/services/guide-availability';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-post-schedule',
  imports: [ReactiveFormsModule],
  templateUrl: './post-schedule.html',
  styleUrl: './post-schedule.scss',
})
export class PostSchedule {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly availabilityService = inject(GuideAvailabilityService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  readonly posted = signal(false);
  readonly error = signal('');
  readonly form = this.fb.nonNullable.group({
    location: ['', [Validators.required, Validators.minLength(2)]],
    spot: ['', [Validators.required, Validators.minLength(3)]],
    date: ['', Validators.required],
    time: ['', Validators.required],
    endTime: ['', Validators.required],
    price: [null, [Validators.required, Validators.min(100)]],
    negotiable: [false],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { location, spot, date, time, endTime } = this.form.getRawValue();
    this.availabilityService
      .create({
        tourGuideId: this.authService.currentUser().id,
        date,
        startTime: time,
        endTime,
        location,
        notes: `Spot: ${spot}`,
      })
      .pipe(
        catchError((err) => {
          this.error.set(err?.message ?? 'Could not post schedule.');
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response) => {
        if (!response) {
          return;
        }
        this.error.set('');
        this.posted.set(true);
        setTimeout(() => void this.router.navigate(['/guide/dashboard']), 800);
      });
  }
}
