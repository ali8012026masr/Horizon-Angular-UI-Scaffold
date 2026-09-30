import {
  AfterViewChecked,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, interval, of, startWith, switchMap } from 'rxjs';
import * as L from 'leaflet';
import { AuthService } from '../../../../core/services/auth';
import { GuideBookingService } from '../../../../core/services/guide-booking';
import { GuideService } from '../../../../core/services/guide';
import { LocationService } from '../../../../core/services/location';
import { GuideBookingResponse } from '../../../../models/guide-booking.model';
import { LocationResponse } from '../../../../models/location.model';
import { ApiError } from '../../../../models/api-error.model';

const POLL_INTERVAL_MS = 12000;
const DEFAULT_CENTER: L.LatLngExpression = [23.8103, 90.4125]; // Dhaka, Bangladesh

const SELF_ICON = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const GUIDE_ICON = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: 'guide-marker',
});

interface TrackableGuide {
  guideId: string;
  guideName: string;
}

@Component({
  selector: 'app-view-location',
  imports: [DatePipe, FormsModule],
  templateUrl: './view-location.html',
  styleUrl: './view-location.scss',
})
export class ViewLocation implements AfterViewChecked, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly guideBookingService = inject(GuideBookingService);
  private readonly guideService = inject(GuideService);
  private readonly locationService = inject(LocationService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('mapContainer') mapContainer?: ElementRef<HTMLDivElement>;

  readonly trackableGuides = signal<TrackableGuide[]>([]);
  readonly selectedGuideId = signal<string | null>(null);
  readonly location = signal<LocationResponse | null>(null);
  readonly locationError = signal('');
  readonly selfLocationError = signal('');

  private map: L.Map | null = null;
  private guideMarker: L.Marker | null = null;
  private selfMarker: L.Marker | null = null;
  private hasCenteredOnSelf = false;

  constructor() {
    this.shareOwnLocation();

    this.guideBookingService
      .listByTourist(this.authService.currentUser().id)
      .pipe(
        catchError(() => of([] as GuideBookingResponse[])),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((bookings) => this.resolveTrackableGuides(bookings));

    effect(() => {
      const selectedGuideId = this.selectedGuideId();
      if (selectedGuideId) {
        this.startPolling(selectedGuideId);
      }
    });
  }

  private shareOwnLocation(): void {
    if (!('geolocation' in navigator)) {
      this.selfLocationError.set('Location is not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.selfLocationError.set('');
        this.renderSelfMarker(position.coords.latitude, position.coords.longitude);
      },
      () => {
        this.selfLocationError.set('Location permission was not granted, showing default map view.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  private resolveTrackableGuides(bookings: GuideBookingResponse[]): void {
    const activeGuideIds = Array.from(
      new Set(bookings.filter((b) => b.status === 'ACCEPTED').map((b) => b.tourGuideId))
    );

    if (activeGuideIds.length === 0) {
      return;
    }

    Promise.all(
      activeGuideIds.map(
        (guideId) =>
          new Promise<TrackableGuide>((resolve) => {
            this.guideService.getById(guideId).subscribe({
              next: (guide) => resolve({ guideId, guideName: guide.fullName }),
              error: () => resolve({ guideId, guideName: `Guide ${guideId}` }),
            });
          })
      )
    ).then((guides) => {
      this.trackableGuides.set(guides);
      if (guides.length > 0) {
        this.selectedGuideId.set(guides[0].guideId);
      }
    });
  }

  selectGuide(guideId: string): void {
    this.selectedGuideId.set(guideId);
    this.location.set(null);
    this.locationError.set('');
  }

  private startPolling(guideId: string): void {
    interval(POLL_INTERVAL_MS)
      .pipe(
        startWith(0),
        switchMap(() =>
          this.locationService.getLocation(guideId).pipe(
            catchError((error: ApiError) => {
              this.locationError.set(error.status === 404 ? 'This guide has not started sharing location yet.' : (error.message || 'Unable to load location.'));
              return of(null);
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((location) => {
        if (!location) {
          return;
        }
        this.locationError.set('');
        this.location.set(location);
        this.renderGuideMarker(location);
      });
  }

  ngAfterViewChecked(): void {
    this.ensureMap();
  }

  private ensureMap(): void {
    if (this.map || !this.mapContainer) {
      return;
    }
    this.map = L.map(this.mapContainer.nativeElement).setView(DEFAULT_CENTER, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);
    // Leaflet measures its container on init; the card/flex layout can settle
    // to its final size a tick later, leaving stale tile sizing otherwise.
    setTimeout(() => this.map?.invalidateSize(), 0);
  }

  private renderSelfMarker(latitude: number, longitude: number): void {
    this.ensureMap();
    if (!this.map) {
      return;
    }
    const position: L.LatLngExpression = [latitude, longitude];
    if (!this.selfMarker) {
      this.selfMarker = L.marker(position, { icon: SELF_ICON }).addTo(this.map).bindPopup('You');
    } else {
      this.selfMarker.setLatLng(position);
    }
    if (!this.hasCenteredOnSelf) {
      this.hasCenteredOnSelf = true;
      this.map.setView(position, 14);
    }
  }

  private renderGuideMarker(location: LocationResponse): void {
    this.ensureMap();
    if (!this.map) {
      return;
    }

    const position: L.LatLngExpression = [location.latitude, location.longitude];
    if (!this.guideMarker) {
      this.guideMarker = L.marker(position, { icon: GUIDE_ICON }).addTo(this.map).bindPopup('Your guide');
      this.map.setView(position, 14);
    } else {
      this.guideMarker.setLatLng(position);
      this.map.panTo(position);
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }
}
