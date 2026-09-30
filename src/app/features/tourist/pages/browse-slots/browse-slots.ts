import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, of, startWith, switchMap, tap } from 'rxjs';
import { ServiceSlotService } from '../../../../core/services/service-slot';
import { CartService } from '../../../../core/services/cart';
import {
  SERVICE_CATEGORIES,
  ServiceCategory,
  ServiceSlotResponse,
  ServiceSlotSearchRequest,
  serviceCategoryLabel,
} from '../../../../models/service-slot.model';
import { ApiError } from '../../../../models/api-error.model';

@Component({
  selector: 'app-browse-slots',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, DecimalPipe],
  templateUrl: './browse-slots.html',
  styleUrl: './browse-slots.scss',
})
export class BrowseSlots {
  private readonly fb = inject(FormBuilder);
  private readonly slotService = inject(ServiceSlotService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);

  readonly categories = SERVICE_CATEGORIES;
  readonly categoryLabel = serviceCategoryLabel;
  readonly loading = signal(true);
  readonly error = signal('');
  readonly slots = signal<ServiceSlotResponse[]>([]);
  readonly cart = inject(CartService);
  readonly cartNotice = signal<{ ok: boolean; text: string } | null>(null);

  addToCart(slot: ServiceSlotResponse): void {
    const result = this.cart.add(slot);
    this.cartNotice.set(
      result.ok
        ? { ok: true, text: 'Added to your cart.' }
        : { ok: false, text: result.reason ?? 'Could not add to cart.' }
    );
  }

  readonly filterForm = this.fb.nonNullable.group({
    category: [''],
    origin: [''],
    destination: [''],
    date: [''],
    maxPrice: [''],
  });

  constructor() {
    // The AI Concierge (ai-concierge.ts) navigates here with query params such
    // as {destination, maxPrice} when the tourist asks it to filter slots -
    // pick those up once on load so the chat-driven "find me X" flow actually
    // filters this page instead of being silently ignored.
    const params = this.route.snapshot.queryParamMap;
    if (params.keys.length > 0) {
      this.filterForm.patchValue({
        category: params.get('category') ?? '',
        origin: params.get('origin') ?? '',
        destination: params.get('destination') ?? '',
        date: params.get('date') ?? '',
        maxPrice: params.get('maxPrice') ?? '',
      });
    }

    this.filterForm.valueChanges
      .pipe(
        startWith(this.filterForm.getRawValue()),
        debounceTime(300),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        tap(() => {
          this.loading.set(true);
          this.error.set('');
        }),
        switchMap((value) =>
          this.slotService.search(this.toSearchRequest(value)).pipe(
            catchError((error: ApiError) => {
              this.error.set(error.message);
              return of([]);
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((slots) => {
        this.slots.set(slots);
        this.loading.set(false);
      });
  }

  private toSearchRequest(value: {
    category?: string;
    origin?: string;
    destination?: string;
    date?: string;
    maxPrice?: string;
  }): ServiceSlotSearchRequest {
    return {
      category: (value.category || undefined) as ServiceCategory | undefined,
      origin: value.origin || undefined,
      destination: value.destination || undefined,
      dateFrom: value.date ? `${value.date}T00:00:00` : undefined,
      dateTo: value.date ? `${value.date}T23:59:59` : undefined,
      maxPrice: value.maxPrice ? Number(value.maxPrice) : undefined,
    };
  }
}
