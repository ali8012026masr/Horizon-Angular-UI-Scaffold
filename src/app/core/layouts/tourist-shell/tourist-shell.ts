import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart';
import { AiConcierge } from '../../../features/tourist/components/ai-concierge/ai-concierge';

@Component({
  selector: 'app-tourist-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, AiConcierge],
  templateUrl: './tourist-shell.html',
  styleUrl: './tourist-shell.scss',
})
export class TouristShell {
  private readonly authService = inject(AuthService);
  readonly user = this.authService.currentUser;
  readonly cart = inject(CartService);
}
