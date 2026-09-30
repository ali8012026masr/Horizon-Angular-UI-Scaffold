import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { GuideAvailabilityService } from '../../../../core/services/guide-availability';
import { GuideService } from '../../../../core/services/guide';
import { GuideAvailabilityResponse } from '../../../../models/guide-availability.model';
import { GuideResponse } from '../../../../models/guide.model';
import { ApiError } from '../../../../models/api-error.model';

interface GuideDetail {
  profile: GuideResponse;
  nextAvailability: GuideAvailabilityResponse | null;
}

@Component({
  selector: 'app-select-guide',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './select-guide.html',
  styleUrl: './select-guide.scss',
})
export class SelectGuide {
  private readonly route = inject(ActivatedRoute);
  private readonly availabilityService = inject(GuideAvailabilityService);
  private readonly guideService = inject(GuideService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly guide = signal<GuideDetail | null>(null);

  constructor() {
    const guideId = this.route.snapshot.paramMap.get('id');
    if (!guideId) {
      this.error.set('Guide ID is missing.');
      this.loading.set(false);
      return;
    }

    forkJoin({
      profile: this.guideService.getById(guideId),
      availability: this.availabilityService.listByGuide(guideId),
    })
      .pipe(
        catchError((error: ApiError) => {
          this.error.set(error.message);
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((result) => {
        this.guide.set(
          result ? { profile: result.profile, nextAvailability: result.availability[0] ?? null } : null
        );
        this.loading.set(false);
      });
  }
}
