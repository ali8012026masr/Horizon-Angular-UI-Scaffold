import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-provider-logout',
  imports: [],
  templateUrl: './logout.html',
  styleUrl: './logout.scss',
})
export class Logout {
  constructor(private readonly authService: AuthService, private readonly router: Router) {
    this.authService.clearSession();
    void this.router.navigate(['/']);
  }
}
