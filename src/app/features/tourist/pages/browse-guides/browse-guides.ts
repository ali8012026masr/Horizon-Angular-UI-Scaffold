import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, of, startWith, switchMap, tap } from 'rxjs';
import { GuideAvailabilityService } from '../../../../core/services/guide-availability';
import { GuideAvailabilityResponse } from '../../../../models/guide-availability.model';
import { ApiError } from '../../../../models/api-error.model';

@Component({
  selector: 'app-browse-guides',
  imports: [RouterLink, ReactiveFormsModule, DecimalPipe],
  templateUrl: './browse-guides.html',
  styleUrl: './browse-guides.scss',
})
export class BrowseGuides {
  private readonly fb = inject(FormBuilder);
  private readonly availabilityService = inject(GuideAvailabilityService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly guides = signal<GuideAvailabilityResponse[]>([]);
  readonly filterForm = this.fb.nonNullable.group({
    location: [''],
  });

  constructor() {
    this.filterForm.valueChanges
      .pipe(
        startWith(this.filterForm.getRawValue()),
        debounceTime(300),
        distinctUntilChanged((a, b) => a.location === b.location),
        tap(() => {
          this.loading.set(true);
          this.error.set('');
        }),
        switchMap(({ location }) =>
          this.availabilityService.search({ location: location || undefined }).pipe(
            catchError((error: ApiError) => {
              this.error.set(error.message);
              return of([]);
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((guides) => {
        this.guides.set(guides);
        this.loading.set(false);
      });
  }
}
