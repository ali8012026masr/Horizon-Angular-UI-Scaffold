import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteHeader } from './core/layouts/site-header/site-header';
import { SiteHero } from './core/layouts/site-hero/site-hero';
import { SiteFooter } from './core/layouts/site-footer/site-footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeader, SiteHero, SiteFooter],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
