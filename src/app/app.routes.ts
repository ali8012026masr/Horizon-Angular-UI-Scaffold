import { Routes } from '@angular/router';

const demoPage = (page: Record<string, unknown>) => ({
  loadComponent: () =>
    import('./features/demo-pages/demo-page.component').then((m) => m.DemoPageComponent),
  data: { page },
});

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'auth',
    loadComponent: () => import('./core/layouts/auth-shell/auth-shell').then((m) => m.AuthShell),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/pages/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/pages/reset-password/reset-password').then((m) => m.ResetPassword),
  },
  {
    path: 'about',
    ...demoPage({
      eyebrow: 'About Horizon',
      title: 'A travel platform built around local discovery',
      summary:
        'Horizon helps travelers explore trusted transport, lodging, and guided experiences in one place.',
      stats: [
        { label: 'Cities covered', value: '45+' },
        { label: 'Travelers matched', value: '18K' },
        { label: 'Service providers', value: '1.2K' },
      ],
      highlights: [
        'Curated discovery for transport, lodging, and activities',
        'Simple booking flow with transparent local pricing',
        'Support for guides, vendors, and tourism partners',
      ],
      links: [
        { label: 'Browse services', route: '/browse' },
        { label: 'Contact', route: '/contact' },
        { label: 'Help center', route: '/help' },
      ],
    }),
  },
  {
    path: 'terms',
    ...demoPage({
      eyebrow: 'Terms',
      title: 'Platform terms and usage guidance',
      summary:
        'These demo terms outline how community members can use Horizon responsibly and transparently.',
      stats: [
        { label: 'Updated', value: '2026' },
        { label: 'Review cycle', value: 'Quarterly' },
        { label: 'Status', value: 'Draft' },
      ],
      highlights: [
        'Bookings are subject to provider confirmation and availability',
        'Users should provide accurate trip and contact details',
        'All content is for demo planning before final legal review',
      ],
      links: [
        { label: 'About', route: '/about' },
        { label: 'Help center', route: '/help' },
        { label: 'Contact', route: '/contact' },
      ],
    }),
  },
  {
    path: 'help',
    ...demoPage({
      eyebrow: 'Help center',
      title: 'Support that keeps travel planning simple',
      summary:
        'This demo support page shows where travelers can find quick answers, service guidance, and contact help.',
      stats: [
        { label: 'Avg reply', value: '2h' },
        { label: 'Faq topics', value: '35+' },
        { label: 'Resolution rate', value: '97%' },
      ],
      highlights: [
        'Responsive support for booking questions and service changes',
        'Self-service answers for common planning issues',
        'Escalation path for provider and traveler coordination',
      ],
      links: [
        { label: 'Terms', route: '/terms' },
        { label: 'Contact', route: '/contact' },
        { label: 'Home', route: '/' },
      ],
    }),
  },
  {
    path: 'contact',
    ...demoPage({
      eyebrow: 'Contact',
      title: 'Let’s talk about your upcoming trip',
      summary:
        'Use this demo contact page to showcase support channels, office details, and the next steps for inquiries.',
      stats: [
        { label: 'Email support', value: '24/7' },
        { label: 'Office hours', value: '9AM-6PM' },
        { label: 'Response', value: '< 1 day' },
      ],
      highlights: [
        'Travel planning support via email and chat',
        'Customer care for travelers, guides, and service providers',
        'Intake flow for partnership, feedback, and bug reporting',
      ],
      links: [
        { label: 'About', route: '/about' },
        { label: 'Help center', route: '/help' },
        { label: 'Terms', route: '/terms' },
      ],
    }),
  },
  {
    path: 'browse',
    ...demoPage({
      eyebrow: 'Browse',
      title: 'Explore services the way travelers do',
      summary:
        'This demo discovery page highlights the major travel options before each service category gets its full frontend build.',
      stats: [
        { label: 'Categories', value: '12' },
        { label: 'Popular routes', value: '80+' },
        { label: 'Filters', value: 'Smart' },
      ],
      highlights: [
        'Browse destination-driven local experiences and trips',
        'Filter by travel type, price, and provider quality',
        'Designed to support future discovery cards and search UX',
      ],
      links: [
        { label: 'Bus', route: '/bus' },
        { label: 'Hotels', route: '/hotels' },
        { label: 'Attractions', route: '/attractions' },
      ],
    }),
  },
  {
    path: 'bus',
    ...demoPage({
      eyebrow: 'Bus',
      title: 'Local and intercity bus discovery demo',
      summary:
        'Showcase bus routes, pickup points, and travel availability for a faster booking flow.',
      stats: [
        { label: 'Routes', value: '320' },
        { label: 'On-time', value: '94%' },
        { label: 'Seats left', value: '2.1K' },
      ],
      highlights: [
        'Route and schedule overview for daily and long-distance travel',
        'Seat availability and departure details in one view',
        'Ready for booking and payment prompts later on',
      ],
      links: [
        { label: 'Hotels', route: '/hotels' },
        { label: 'Guides', route: '/guides' },
        { label: 'Browse', route: '/browse' },
      ],
    }),
  },
  {
    path: 'hotels',
    ...demoPage({
      eyebrow: 'Hotels',
      title: 'Stay options for every trip style',
      summary:
        'This hotel demo page introduces destination stays, room categories, and booking decision points.',
      stats: [
        { label: 'Listings', value: '480' },
        { label: 'Avg rating', value: '4.8' },
        { label: 'Verified stays', value: '93%' },
      ],
      highlights: [
        'Room tiers, amenities, and location highlights',
        'Flexible stay filters for budget and family travel',
        'Made for future date selection and booking confirmation',
      ],
      links: [
        { label: 'Bus', route: '/bus' },
        { label: 'Attractions', route: '/attractions' },
        { label: 'Browse', route: '/browse' },
      ],
    }),
  },
  {
    path: 'guides',
    ...demoPage({
      eyebrow: 'Guides',
      title: 'Trusted local guidance and tour planning',
      summary:
        'This guide discovery page shows how travelers can compare local experts, expertise, and request types.',
      stats: [
        { label: 'Experts', value: '250' },
        { label: 'Languages', value: '18' },
        { label: 'Trips booked', value: '5K' },
      ],
      highlights: [
        'Profiles, specialities, and traveler ratings',
        'Availability and trip orientation tools',
        'Clear next steps for requesting a guide',
      ],
      links: [
        { label: 'Attractions', route: '/attractions' },
        { label: 'Others', route: '/others' },
        { label: 'Browse', route: '/browse' },
      ],
    }),
  },
  {
    path: 'attractions',
    ...demoPage({
      eyebrow: 'Attractions',
      title: 'See what is worth visiting nearby',
      summary:
        'This attraction page demo frames how destination highlights, timings, and local favorites can be surfaced.',
      stats: [
        { label: 'Landmarks', value: '140' },
        { label: 'Best reviews', value: '4.9' },
        { label: 'Open today', value: '86%' },
      ],
      highlights: [
        'Highlights for scenic, cultural, and family-friendly stops',
        'Hours, costs, and local recommendations in one panel',
        'Easy way to connect sightseeing with broader trip planning',
      ],
      links: [
        { label: 'Guides', route: '/guides' },
        { label: 'Others', route: '/others' },
        { label: 'Browse', route: '/browse' },
      ],
    }),
  },
  {
    path: 'others',
    ...demoPage({
      eyebrow: 'Others',
      title: 'Additional services and local experiences',
      summary:
        'This category page gives space for miscellaneous trip needs, special requests, and local experiences.',
      stats: [
        { label: 'Services', value: '90' },
        { label: 'Custom plans', value: '100+' },
        { label: 'Flexibility', value: 'High' },
      ],
      highlights: [
        'Custom service requests and local partnerships',
        'Flexible trip support outside the standard categories',
        'Built to expand into concierge-style travel services',
      ],
      links: [
        { label: 'Browse', route: '/browse' },
        { label: 'Bus', route: '/bus' },
        { label: 'Hotels', route: '/hotels' },
      ],
    }),
  },
  {
    path: '-',
    ...demoPage({
      eyebrow: 'Explore',
      title: 'Simple placeholder route for legacy navigation',
      summary:
        'This demo route supports older placeholder links until the real page is ready to replace it.',
      stats: [
        { label: 'Status', value: 'Demo' },
        { label: 'Purpose', value: 'Legacy' },
        { label: 'Target', value: 'Browse' },
      ],
      highlights: [
        'Keeps older navigation links from breaking',
        'Points visitors toward the discovery experience',
        'Easy to replace once a finalized page is developed',
      ],
      links: [
        { label: 'Browse', route: '/browse' },
        { label: 'Home', route: '/' },
        { label: 'About', route: '/about' },
      ],
    }),
  },
  {
    path: 'tourist',
    loadChildren: () =>
      import('./features/tourist/tourist.routes').then((m) => m.TOURIST_ROUTES),
  },
  {
    path: 'provider',
    loadChildren: () =>
      import('./features/provider/provider.routes').then((m) => m.PROVIDER_ROUTES),
  },
  {
    path: 'guide',
    loadChildren: () => import('./features/guide/guide.routes').then((m) => m.GUIDE_ROUTES),
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
