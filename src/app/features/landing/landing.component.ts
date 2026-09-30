import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ServiceSlotService } from '../../core/services/service-slot';
import { SERVICE_CATEGORIES, ServiceCategory, ServiceSlotResponse, serviceCategoryLabel } from '../../models/service-slot.model';
import { ApiError } from '../../models/api-error.model';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  private readonly fb = inject(FormBuilder);
  private readonly slotService = inject(ServiceSlotService);
  private readonly destroyRef = inject(DestroyRef);

  readonly categories = SERVICE_CATEGORIES;
  readonly categoryLabel = serviceCategoryLabel;
  readonly loading = signal(true);
  readonly error = signal('');
  readonly slots = signal<ServiceSlotResponse[]>([]);
  readonly filteredSlots = signal<ServiceSlotResponse[]>([]);

  readonly searchForm = this.fb.nonNullable.group({
    category: ['', Validators.required],
    origin: [''],
    destination: [''],
  });

  constructor() {
    this.loadSlots();
  }

  private loadSlots(): void {
    this.loading.set(true);
    this.error.set('');
    this.slotService
      .search({})
      .pipe(
        catchError((error: ApiError) => {
          this.error.set(error.message);
          return of([]);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((slots) => {
        this.slots.set(slots);
        this.filteredSlots.set(slots);
        this.loading.set(false);
      });
  }

  search(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const { category, origin, destination } = this.searchForm.getRawValue();
    const queryOrigin = origin.trim().toLowerCase();
    const queryDestination = destination.trim().toLowerCase();

    this.filteredSlots.set(
      this.slots()
        .filter((slot) => slot.category === (category as ServiceCategory))
        .filter((slot) => {
          const place = `${slot.origin ?? ''} ${slot.locationName ?? ''}`.toLowerCase();
          return (
            (!queryOrigin || place.includes(queryOrigin)) &&
            (!queryDestination || (slot.destination ?? '').toLowerCase().includes(queryDestination))
          );
        })
    );
  }

  resetSearch(): void {
    this.searchForm.reset({ category: '', origin: '', destination: '' });
    this.filteredSlots.set(this.slots());
  }
}
