import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { catchError, of } from 'rxjs';
import { LookupDataService } from '../../../../mock-data/lookup-data';
import { SlotCategory } from '../../../../models/slot.model';
import { SERVICE_CATEGORIES } from '../../../../models/service-slot.model';
import { ServiceSlotService } from '../../../../core/services/service-slot';
import { AuthService } from '../../../../core/services/auth';

type SlotFormType = 'transport' | 'stay' | 'venue' | 'dining' | 'amusement';

const FORM_TYPE_BY_CATEGORY: Record<SlotCategory, SlotFormType> = {
  Bus: 'transport',
  'Micro-bus': 'transport',
  Launch: 'transport',
  Train: 'transport',
  Airplane: 'transport',
  Ship: 'transport',
  Hotel: 'stay',
  Resort: 'stay',
  'Convention Center': 'venue',
  Buffet: 'dining',
  'Amusement Park': 'amusement',
};

@Component({
  selector: 'app-enter-slot-details',
  imports: [ReactiveFormsModule],
  templateUrl: './enter-slot-details.html',
  styleUrl: './enter-slot-details.scss',
})
export class EnterSlotDetails {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly slotService = inject(ServiceSlotService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  readonly categories = inject(LookupDataService).slotCategories;
  readonly error = signal('');

  readonly category = signal<SlotCategory>('Bus');
  readonly formType = computed<SlotFormType>(() => FORM_TYPE_BY_CATEGORY[this.category()]);

  readonly form = this.fb.nonNullable.group({
    category: ['Bus' as SlotCategory, Validators.required],
    origin: ['', Validators.required],
    destination: ['', Validators.required],
    startDate: ['', Validators.required],
    startTime: ['', Validators.required],
    capacity: [1, [Validators.required, Validators.min(1), Validators.max(3000)]],
    price: [100, [Validators.required, Validators.min(1)]],
    endDate: ['', Validators.required],
    venueName: ['', Validators.required],
  });

  constructor() {
    // If navigated from category selection, pre-fill category and update validators accordingly.
    const selected = this.route.snapshot.queryParams['category'] as SlotCategory | undefined;
    if (selected && this.categories.includes(selected)) {
      this.form.controls.category.setValue(selected);
      this.category.set(selected);
    }

    this.applyValidatorsForType();
  }

  onCategoryChange(): void {
    this.category.set(this.form.controls.category.value);
    this.applyValidatorsForType();
  }

  private applyValidatorsForType(): void {
    const type = this.formType();
    const needsStartTime = type !== 'stay';
    const needsEndDate = type === 'stay';
    const needsVenueName = type !== 'transport';
    const needsDestination = type === 'transport';

    this.setRequired(this.form.controls.startTime, needsStartTime);
    this.setRequired(this.form.controls.endDate, needsEndDate);
    this.setRequired(this.form.controls.venueName, needsVenueName);
    this.setRequired(this.form.controls.destination, needsDestination);
  }

  private setRequired(control: FormControl<any>, required: boolean): void {
    control.setValidators(required ? [Validators.required] : []);
    control.updateValueAndValidity({ emitEvent: false });
  }

  publish(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const serviceCategory = SERVICE_CATEGORIES.find((entry) => entry.label === raw.category)?.value;
    if (!serviceCategory) {
      this.error.set('Unknown category.');
      return;
    }

    const isStay = this.formType() === 'stay';
    const startAt = isStay ? `${raw.startDate}T12:00:00` : `${raw.startDate}T${raw.startTime}:00`;
    const endAt = isStay
      ? `${raw.endDate}T12:00:00`
      : new Date(new Date(startAt).getTime() + 3 * 60 * 60 * 1000).toISOString().slice(0, 19);

    this.slotService
      .create({
        providerId: this.authService.currentUser().id,
        category: serviceCategory,
        origin: this.formType() === 'transport' ? raw.origin : undefined,
        destination: this.formType() === 'transport' ? raw.destination : undefined,
        locationName:
          this.formType() === 'transport'
            ? undefined
            : [raw.venueName, raw.origin].filter((part) => !!part).join(' — '),
        startAt,
        endAt,
        capacity: raw.capacity,
        price: raw.price,
      })
      .pipe(
        catchError((err) => {
          this.error.set(err?.message ?? 'Could not publish slot.');
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response) => {
        if (!response) {
          return;
        }
        void this.router.navigate(['/provider/slots/publish']);
      });
  }
}
