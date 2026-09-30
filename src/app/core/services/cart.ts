import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { ServiceSlotResponse } from '../../models/service-slot.model';
import { AuthService } from './auth';

const CART_KEY_PREFIX = 'horizon-cart-';
const STAY_CATEGORIES = ['HOTEL', 'RESORT'];
const MIN_GAP_MS = 2 * 60 * 60 * 1000;

interface StoredCart {
  items: ServiceSlotResponse[];
  budget: number | null;
  selectedIds?: string[];
}

export interface CartAddResult {
  ok: boolean;
  reason?: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly authService = inject(AuthService);

  readonly items = signal<ServiceSlotResponse[]>([]);
  readonly budget = signal<number | null>(null);

  readonly count = computed(() => this.items().length);
  readonly selectedIds = signal<string[]>([]);
  readonly selectedItems = computed(() => {
    const ids = this.selectedIds();
    return this.items().filter((slot) => ids.includes(slot.id));
  });
  readonly selectedCount = computed(() => this.selectedItems().length);
  readonly total = computed(() =>
    this.selectedItems().reduce((sum, slot) => sum + slot.price, 0)
  );
  readonly allSelected = computed(
    () => this.items().length > 0 && this.selectedCount() === this.items().length
  );
  readonly remaining = computed(() => {
    const budget = this.budget();
    return budget === null ? null : budget - this.total();
  });
  readonly overBudget = computed(() => {
    const remaining = this.remaining();
    return remaining !== null && remaining < 0;
  });

  private loadedFor = '';

  constructor() {
    effect(() => {
      const userId = this.authService.currentUser().id;
      if (userId !== this.loadedFor) {
        this.loadedFor = userId;
        this.load(userId);
      }
    });

    effect(() => {
      const state: StoredCart = { items: this.items(), budget: this.budget(), selectedIds: this.selectedIds() };
      if (!this.loadedFor) {
        return;
      }
      try {
        localStorage.setItem(CART_KEY_PREFIX + this.loadedFor, JSON.stringify(state));
      } catch {
        // storage unavailable: cart stays in memory only
      }
    });
  }

  has(slotId: string): boolean {
    return this.items().some((slot) => slot.id === slotId);
  }

  add(slot: ServiceSlotResponse): CartAddResult {
    if (slot.status !== 'OPEN' || slot.availableSeats <= 0) {
      return { ok: false, reason: 'This service is not available.' };
    }
    if (this.has(slot.id)) {
      return { ok: false, reason: 'Already in your cart.' };
    }
    const clash = this.items().find((existing) => this.conflicts(existing, slot));
    if (clash) {
      return {
        ok: false,
        reason: `Not compatible with ${clash.providerName} (${clash.startAt.slice(0, 16).replace('T', ' ')}): overlapping time.`,
      };
    }
    this.items.update((items) => [...items, slot]);
    this.selectedIds.update((ids) => [...ids, slot.id]);
    return { ok: true };
  }

  remove(slotId: string): void {
    this.items.update((items) => items.filter((slot) => slot.id !== slotId));
    this.selectedIds.update((ids) => ids.filter((id) => id !== slotId));
  }

  clear(): void {
    this.items.set([]);
    this.selectedIds.set([]);
  }

  isSelected(slotId: string): boolean {
    return this.selectedIds().includes(slotId);
  }

  toggle(slotId: string): void {
    this.selectedIds.update((ids) =>
      ids.includes(slotId) ? ids.filter((id) => id !== slotId) : [...ids, slotId]
    );
  }

  toggleAll(): void {
    this.selectedIds.set(this.allSelected() ? [] : this.items().map((slot) => slot.id));
  }

  setBudget(value: number | null): void {
    this.budget.set(value !== null && value > 0 ? value : null);
  }

  private conflicts(a: ServiceSlotResponse, b: ServiceSlotResponse): boolean {
    const aStay = STAY_CATEGORIES.includes(a.category);
    const bStay = STAY_CATEGORIES.includes(b.category);
    const aStart = new Date(a.startAt).getTime();
    const bStart = new Date(b.startAt).getTime();

    if (aStay && bStay) {
      const aEnd = a.endAt ? new Date(a.endAt).getTime() : aStart;
      const bEnd = b.endAt ? new Date(b.endAt).getTime() : bStart;
      return aStart < bEnd && bStart < aEnd;
    }
    if (!aStay && !bStay) {
      return Math.abs(aStart - bStart) < MIN_GAP_MS;
    }
    return false;
  }

  private load(userId: string): void {
    let stored: StoredCart | null = null;
    try {
      const raw = localStorage.getItem(CART_KEY_PREFIX + userId);
      stored = raw ? (JSON.parse(raw) as StoredCart) : null;
    } catch {
      stored = null;
    }
    const items = stored?.items ?? [];
    this.items.set(items);
    const valid = new Set(items.map((slot) => slot.id));
    this.selectedIds.set(
      stored?.selectedIds ? stored.selectedIds.filter((id) => valid.has(id)) : [...valid]
    );
    this.budget.set(stored?.budget ?? null);
  }
}
