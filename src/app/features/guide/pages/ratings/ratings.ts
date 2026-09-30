import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { catchError, map, of } from 'rxjs';
import { RatingService } from '../../../../core/services/rating';
import { AuthService } from '../../../../core/services/auth';
import { GuideRating } from '../../../../models/guide.model';
import { ApiError } from '../../../../models/api-error.model';

@Component({
  selector: 'app-guide-ratings',
  imports: [DatePipe],
  templateUrl: './ratings.html',
  styleUrl: './ratings.scss',
})
export class Ratings {
  private readonly ratingService = inject(RatingService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly ratings = signal<GuideRating[]>([]);

  constructor() {
    this.loadRatings();
  }

  private loadRatings(): void {
    this.loading.set(true);
    this.error.set('');
    this.ratingService
      .getGuideRatings(this.authService.currentUser().id)
      .pipe(
        map((responses) =>
          responses.map((response) => ({
            id: response.id,
            tourist: response.guideBookingId,
            score: response.score,
            comment: response.comment,
            receivedAt: response.ratedDate,
          }))
        ),
        catchError((error: ApiError) => {
          this.error.set(error.message);
          return of([]);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((ratings) => {
        this.ratings.set(ratings);
        this.loading.set(false);
      });
  }
}
