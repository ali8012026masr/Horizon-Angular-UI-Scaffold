import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, concatMap, from, map, of, switchMap, toArray } from 'rxjs';
import { CartService } from '../../../../core/services/cart';
import { BookingService } from '../../../../core/services/booking';
import { PaymentService } from '../../../../core/services/payment';
import { AuthService } from '../../../../core/services/auth';
import { PaymentMethod } from '../../../../models/payment.model';
import { ServiceSlotResponse, serviceCategoryLabel } from '../../../../models/service-slot.model';

@Component({
  selector: 'app-cart',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, DecimalPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingService);
  private readonly paymentService = inject(PaymentService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  readonly cart = inject(CartService);

  readonly categoryLabel = serviceCategoryLabel;
  readonly paying = signal(false);
  readonly failedIds = signal<string[]>([]);
  readonly message = signal('');

  readonly budgetForm = this.fb.control<number | null>(this.cart.budget(), [Validators.min(1)]);

  readonly paymentForm = this.fb.nonNullable.group({
    method: ['CARD' as PaymentMethod, Validators.required],
    cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3}$/)]],
  });

  readonly usedPercent = computed(() => {
    const budget = this.cart.budget();
    if (!budget) {
      return 0;
    }
    return Math.min(100, Math.round((this.cart.total() / budget) * 100));
  });

  readonly canPay = computed(
    () => this.cart.selectedCount() > 0 && !this.cart.overBudget() && !this.paying()
  );

  applyBudget(): void {
    const value = this.budgetForm.value;
    this.cart.setBudget(value === null || value === undefined ? null : Number(value));
  }

  clearBudget(): void {
    this.budgetForm.setValue(null);
    this.cart.setBudget(null);
  }

  remove(slot: ServiceSlotResponse): void {
    this.cart.remove(slot.id);
  }

  checkout(): void {
    if (!this.canPay()) {
      return;
    }
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const touristId = this.authService.currentUser().id;
    const method = this.paymentForm.controls.method.value;
    const items = [...this.cart.selectedItems()];

    this.paying.set(true);
    this.failedIds.set([]);
    this.message.set('');

    from(items)
      .pipe(
        concatMap((slot) =>
          this.bookingService.create({ slotId: slot.id, touristId }).pipe(
            switchMap((booking) =>
              this.paymentService.create({ bookingId: booking.id, amount: booking.amount, method })
            ),
            switchMap((payment) => this.paymentService.updateStatus(payment.id, 'SUCCESS')),
            map(() => ({ slot, ok: true })),
            catchError(() => of({ slot, ok: false }))
          )
        ),
        toArray(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((results) => {
        this.paying.set(false);
        for (const result of results) {
          if (result.ok) {
            this.cart.remove(result.slot.id);
          }
        }
        const failed = results.filter((result) => !result.ok).map((result) => result.slot.id);
        this.failedIds.set(failed);
        if (failed.length === 0) {
          this.message.set('All services confirmed. Redirecting to your bookings...');
          setTimeout(() => void this.router.navigate(['/tourist/booking-confirmation']), 800);
        } else {
          this.message.set(
            `${results.length - failed.length} confirmed, ${failed.length} failed and kept in your cart. Retry or remove them.`
          );
        }
      });
  }
}
