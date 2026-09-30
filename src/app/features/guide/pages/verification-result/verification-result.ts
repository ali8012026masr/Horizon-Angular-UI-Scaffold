import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-guide-verification-result',
  imports: [],
  templateUrl: './verification-result.html',
  styleUrl: './verification-result.scss',
})
export class VerificationResult {
  readonly approved = signal<boolean | null>(null);
  private readonly router = inject(Router);

  continue(): void {
    if (this.approved()) {
      void this.router.navigate(['/guide/login']);
    } else {
      void this.router.navigate(['/guide/apply']);
    }
  }
}
