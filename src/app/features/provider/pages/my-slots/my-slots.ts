import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth';
import { ServiceSlotService } from '../../../../core/services/service-slot';
import { ApiError } from '../../../../models/api-error.model';
import { ServiceSlotResponse, serviceCategoryLabel } from '../../../../models/service-slot.model';

interface SlotDraft {
  origin: string;
  destination: string;
  locationName: string;
  startAt: string;
  endAt: string;
  capacity: number;
  price: number;
}

@Component({
  selector: 'app-my-slots',
  imports: [FormsModule, DatePipe, CurrencyPipe, RouterLink],
  templateUrl: './my-slots.html',
  styleUrl: './my-slots.scss',
})
export class MySlots {
  private readonly slotService = inject(ServiceSlotService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly success = signal('');
  readonly slots = signal<ServiceSlotResponse[]>([]);
  readonly editingId = signal<string | null>(null);
  readonly draft = signal<SlotDraft | null>(null);
  readonly savingId = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);

  constructor() {
    this.loadSlots();
  }

  private loadSlots(): void {
    this.loading.set(true);
    this.error.set('');

    this.slotService
      .listByProvider(this.authService.currentUser().id)
      .pipe(
        catchError((error: ApiError) => {
          this.error.set(error.message || 'Unable to load your published service slots.');
          this.slots.set([]);
          return of([] as ServiceSlotResponse[]);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((slots) => {
        this.slots.set(slots);
        this.loading.set(false);
      });
  }

  getRoute(slot: ServiceSlotResponse): string {
    return slot.origin
      ? `${slot.origin} → ${slot.destination ?? 'Destination'}`
      : (slot.locationName ?? 'Service location');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'OPEN':
        return 'bg-success-subtle text-success-emphasis';
      case 'FULL':
        return 'bg-warning-subtle text-warning-emphasis';
      case 'CLOSED':
        return 'bg-secondary-subtle text-secondary-emphasis';
      case 'CANCELLED':
        return 'bg-danger-subtle text-danger-emphasis';
      default:
        return 'bg-light text-dark';
    }
  }

  getEditFormType(slot: ServiceSlotResponse): 'transport' | 'stay' | 'venue' | 'dining' | 'amusement' {
    switch (slot.category) {
      case 'BUS':
      case 'MICROBUS':
      case 'LAUNCH':
      case 'TRAIN':
      case 'AIRPLANE':
      case 'SHIP':
        return 'transport';
      case 'HOTEL':
      case 'RESORT':
        return 'stay';
      case 'CONVENTION_CENTER':
        return 'venue';
      case 'BUFFET':
        return 'dining';
      case 'AMUSEMENT_PARK':
        return 'amusement';
      default:
        return 'transport';
    }
  }

  toDateTimeInput(value: string | undefined): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value.slice(0, 16);
    }

    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }

  startEdit(slot: ServiceSlotResponse): void {
    this.editingId.set(slot.id);
    this.draft.set({
      origin: slot.origin ?? '',
      destination: slot.destination ?? '',
      locationName: slot.locationName ?? '',
      startAt: slot.startAt,
      endAt: slot.endAt ?? '',
      capacity: slot.capacity,
      price: slot.price,
    });
    this.error.set('');
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.draft.set(null);
  }

  updateDraft<K extends keyof SlotDraft>(key: K, value: SlotDraft[K]): void {
    this.draft.update((current) => {
      if (!current) {
        return current;
      }
      return { ...current, [key]: value };
    });
  }

  saveEdit(): void {
    const slotId = this.editingId();
    const draft = this.draft();
    const slot = this.slots().find((item) => item.id === slotId);
    if (!slotId || !draft || !slot) {
      return;
    }

    this.savingId.set(slotId);
    this.error.set('');

    const isTransport = this.getEditFormType(slot) === 'transport';

    this.slotService
      .update(slotId, {
        origin: isTransport ? draft.origin || undefined : undefined,
        destination: isTransport ? draft.destination || undefined : undefined,
        locationName: isTransport ? undefined : draft.locationName || undefined,
        startAt: draft.startAt || undefined,
        endAt: draft.endAt || undefined,
        capacity: draft.capacity,
        price: draft.price,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.success.set('Service slot updated successfully.');
          this.savingId.set(null);
          this.cancelEdit();
          this.loadSlots();
        },
        error: (error: ApiError) => {
          this.error.set(error.message || 'Unable to update this service slot.');
          this.savingId.set(null);
        },
      });
  }

  deleteSlot(slotId: string): void {
    if (!window.confirm('Delete this published service slot?')) {
      return;
    }

    this.deletingId.set(slotId);
    this.error.set('');
    this.success.set('');

    this.slotService
      .delete(slotId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.success.set('Service slot deleted successfully.');
          this.deletingId.set(null);
          this.loadSlots();
        },
        error: (error: ApiError) => {
          this.error.set(error.message || 'Unable to delete this service slot.');
          this.deletingId.set(null);
        },
      });
  }

  labelFor(category: string): string {
    return serviceCategoryLabel(category as never);
  }
}
