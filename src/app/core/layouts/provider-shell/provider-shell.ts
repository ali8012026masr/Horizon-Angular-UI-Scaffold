import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-provider-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './provider-shell.html',
  styleUrl: './provider-shell.scss',
})
export class ProviderShell {
  private readonly authService = inject(AuthService);
  readonly user = this.authService.currentUser;
}
