import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { ServiceSlotService } from '../../../../core/services/service-slot';
import { BookingService } from '../../../../core/services/booking';
import { PaymentService } from '../../../../core/services/payment';
import { AuthService } from '../../../../core/services/auth';
import { ServiceSlotResponse } from '../../../../models/service-slot.model';
import { PaymentMethod } from '../../../../models/payment.model';
import { ApiError } from '../../../../models/api-error.model';

@Component({
  selector: 'app-payment',
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe],
  templateUrl: './payment.html',
  styleUrl: './payment.scss',
})
export class Payment {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly slotService = inject(ServiceSlotService);
  private readonly bookingService = inject(BookingService);
  private readonly paymentService = inject(PaymentService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  readonly paymentState = signal<'idle' | 'success' | 'failed'>('idle');

  readonly loading = signal(true);
  readonly error = signal('');
  readonly slot = signal<ServiceSlotResponse | null>(null);

  readonly paymentForm = this.fb.nonNullable.group({
    method: ['CARD' as PaymentMethod, Validators.required],
    cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3}$/)]],
  });

  constructor() {
    const slotId = this.route.snapshot.paramMap.get('id');
    if (!slotId) {
      this.error.set('Invalid slot selection for payment.');
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

  pay(): void {
    const slot = this.slot();
    if (this.paymentForm.invalid || !slot) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.bookingService
      .create({
        slotId: slot.id,
        touristId: this.authService.currentUser().id,
      })
      .pipe(
        switchMap((booking) =>
          this.paymentService.create({
            bookingId: booking.id,
            amount: booking.amount,
            method: this.paymentForm.controls.method.value,
          })
        ),
        switchMap((payment) => this.paymentService.updateStatus(payment.id, 'SUCCESS')),
        catchError((error: ApiError) => {
          this.paymentState.set('failed');
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((payment) => {
        if (!payment) {
          return;
        }
        this.paymentState.set('success');
        setTimeout(() => {
          void this.router.navigate(['/tourist/booking-confirmation']);
        }, 800);
      });
  }
}
