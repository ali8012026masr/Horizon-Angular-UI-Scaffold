import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-guide-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './guide-shell.html',
  styleUrl: './guide-shell.scss',
})
export class GuideShell {
  private readonly authService = inject(AuthService);
  readonly user = this.authService.currentUser;
}
