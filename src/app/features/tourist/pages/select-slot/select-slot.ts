import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ServiceSlotService } from '../../../../core/services/service-slot';
import { CartService } from '../../../../core/services/cart';
import { ServiceSlotResponse, serviceCategoryLabel } from '../../../../models/service-slot.model';
import { ApiError } from '../../../../models/api-error.model';

@Component({
  selector: 'app-select-slot',
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './select-slot.html',
  styleUrl: './select-slot.scss',
})
export class SelectSlot {
  private readonly route = inject(ActivatedRoute);
  private readonly slotService = inject(ServiceSlotService);
  private readonly destroyRef = inject(DestroyRef);

  readonly categoryLabel = serviceCategoryLabel;
  readonly loading = signal(true);
  readonly error = signal('');
  readonly slot = signal<ServiceSlotResponse | null>(null);
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

  constructor() {
    const slotId = this.route.snapshot.paramMap.get('id');
    if (!slotId) {
      this.error.set('Invalid slot selection.');
      this.loading.set(false);
      return;
    }

    this.slotService
      .getById(slotId)
      .pipe(
        catchError((error: ApiError) => {
          this.error.set(error.message);
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((slot) => {
        this.slot.set(slot);
        this.loading.set(false);
      });
  }
}
