import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/services/auth';
import { LocationService } from '../../../../core/services/location';

@Component({
  selector: 'app-conduct-tour',
  imports: [],
  templateUrl: './conduct-tour.html',
  styleUrl: './conduct-tour.scss',
})
export class ConductTour {
  private readonly authService = inject(AuthService);
  private readonly locationService = inject(LocationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly sharingEnabled = signal(false);
  readonly sharingError = signal('');
  readonly paymentRequested = signal(false);
  readonly paymentReceived = signal(false);

  private watchId: number | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.stopSharing());
  }

  toggleSharing(): void {
    if (this.sharingEnabled()) {
      this.stopSharing();
      this.sharingEnabled.set(false);
      return;
    }
    this.startSharing();
  }

  private startSharing(): void {
    if (!('geolocation' in navigator)) {
      this.sharingError.set('Geolocation is not supported by this browser.');
      return;
    }

    this.sharingError.set('');
    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.pushPosition(position),
      (error) => {
        this.sharingError.set(`Unable to access location: ${error.message}`);
        this.sharingEnabled.set(false);
        this.stopSharing();
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
    this.sharingEnabled.set(true);
  }

  private stopSharing(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  private pushPosition(position: GeolocationPosition): void {
    this.locationService
      .updateLocation(this.authService.currentUser().id, {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error) => this.sharingError.set(error?.message ?? 'Unable to share location.'),
      });
  }

  requestPayment(): void {
    this.paymentRequested.set(true);
  }

  receivePayment(): void {
    this.paymentReceived.set(true);
  }
}
