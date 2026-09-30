import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-site-hero',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './site-hero.html',
  styleUrls: ['./site-hero.scss'],
})
export class SiteHero {}
