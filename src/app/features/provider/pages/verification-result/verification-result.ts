import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-verification-result',
  imports: [RouterLink],
  templateUrl: './verification-result.html',
  styleUrl: './verification-result.scss',
})
export class VerificationResult {
  readonly approved = signal(true);
}
