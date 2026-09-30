import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

type DemoStat = {
  label: string;
  value: string;
};

type DemoPageConfig = {
  eyebrow: string;
  title: string;
  summary: string;
  stats: DemoStat[];
  highlights: string[];
  links: { label: string; route: string }[];
};

const defaultPage: DemoPageConfig = {
  eyebrow: 'Demo page',
  title: 'Horizon page preview',
  summary: 'This page is a front-end demo placeholder for the feature area that is still being built.',
  stats: [
    { label: 'Visitors', value: '12K' },
    { label: 'Avg time', value: '3m' },
    { label: 'Satisfaction', value: '96%' },
  ],
  highlights: ['Landing experience for local discovery', 'Responsive layout for mobile and desktop', 'Ready for feature-specific content later'],
  links: [
    { label: 'Browse', route: '/browse' },
    { label: 'About', route: '/about' },
    { label: 'Help center', route: '/help' },
  ],
};

@Component({
  selector: 'app-demo-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './demo-page.component.html',
  styleUrl: './demo-page.component.scss',
})
export class DemoPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly page: DemoPageConfig = this.route.snapshot.data['page'] ?? defaultPage;
}
