# Claude-in-VS-Code Instructions — Horizon Angular HTTP Service Layer

Paste everything inside the fenced block below into Claude inside VS Code,
with your Horizon Angular workspace open. It assumes the backend from
`Horizon_Spring_Backend_Claude_Instructions_v2.md` exists and is running
on `http://localhost:8080`, and that the frontend already has the
standalone-component structure, role-guarded lazy routes, and mock
auth/session + mock domain data services described in your scaffold plan.

This phase's job is narrow: build the real HTTP service layer and the
TypeScript models it needs, and swap the mock domain data services for
it — without security/JWT (the backend has none yet) and without
touching route guards, which should keep using the existing mock
session/role logic for now.

```
You are working inside an existing Angular (standalone components,
Angular v22(whatever version it is written in the json) built-in control flow) project called "Horizon" — the
frontend for an all-in-one tourism booking platform with four roles:
SYSTEM ADMIN, SERVICE PROVIDER, TOUR GUIDE, TOURIST. The Spring Boot
backend for this project already exists and exposes REST endpoints under
`/api/...` on `http://localhost:8080` (see the endpoint list below —
these come directly from the backend's actual controllers, don't invent
different paths).

Your job: build a typed HTTP service layer (models + services +
interceptor) that talks to this backend, and wire it in to replace the
existing mock domain data services — WITHOUT touching:
- Route guards / role-based route protection (keep using the existing
  mock session logic for now — the backend has no security layer yet,
  so there is nothing real to guard against).
- The mock login/session-switching mechanism itself, EXCEPT that
  `AuthService.login()` should now call the real
  `POST /api/auth/login` endpoint and store whatever it returns as the
  active session, instead of returning a hardcoded mock user.

=== SCOPE FOR THIS PHASE (explicit boundaries) ===
- No JWT, no auth headers, no token refresh logic — every request is
  unauthenticated, matching the backend. Don't add an Authorization
  header "for later"; add it in the real security phase when there's
  something to put in it.
- No optimistic UI / offline caching layer. Straightforward
  request-in, response-out services.
- Do build proper loading/empty/error state support in each service
  call site (the frontend plan already calls for loading/empty/error
  states on list pages — this phase gives those pages real data and
  real errors to render, it doesn't invent the state-handling pattern
  from scratch if components already have one; if they don't yet, add a
  minimal one you can point me to).
- Do NOT restructure existing feature folders. Add
  `core/models/`, `core/services/`, and `core/interceptors/` (or match
  whatever `core/` convention already exists in the project — check
  first) rather than reorganizing what's there.

=== BEFORE YOU START ===
1. Inspect the existing project structure: where do mock domain data
   services currently live, what do their method signatures look like
   (so components calling them don't need to change more than
   necessary), and is there already an `environment.ts` /
   `environment.development.ts` pair?
2. Show me the list of existing mock services you plan to replace or
   wrap, and the new file layout, before generating anything.
3. Build in this order, with a short summary after each stage so I can
   review before you continue:
   (1) environment config + base HTTP setup + interceptor,
   (2) models/interfaces for all DTOs,
   (3) AuthService (real login/register) + session wiring,
   (4) Tourist-facing services (slots search, bookings, guide
       availability browse, guide bookings, groups, ratings),
   (5) Provider-facing services (own slots CRUD, own bookings),
   (6) Guide-facing services (own availability CRUD, own guide
       bookings),
   (7) Admin-facing services (verification, user management, payments,
       commissions, reports),
   (8) swap mock services for real ones at call sites, run a build,
       fix errors.
4. After each stage, run `ng build` (or the equivalent) and fix any
   errors before moving to the next stage.

=== ENVIRONMENT CONFIG ===
- Add/confirm `apiUrl: 'http://localhost:8080/api'` in
  `environment.development.ts`, and a placeholder production value
  (don't invent a real prod URL) in `environment.ts`.
- Confirm `provideHttpClient(...)` is registered in `app.config.ts`
  (or `app.module.ts` if this is still NgModule-based — check first);
  add `withInterceptors([apiErrorInterceptor])` there.

=== HTTP ERROR INTERCEPTOR ===
Add a functional interceptor (`HttpInterceptorFn`,
`core/interceptors/api-error.interceptor.ts`) that:
- Catches errors from every request.
- Maps the backend's error body shape
  (`{ timestamp, status, message, errors? }` — this matches
  `GlobalExceptionHandler` on the backend) into a normalized
  `ApiError` model (see below) rather than leaving components to parse
  raw `HttpErrorResponse` bodies.
- Re-throws the normalized error so callers still use `catchError` at
  the call site to decide what to do (show a toast, set a component
  error signal, etc.) — the interceptor normalizes, it doesn't decide
  UI behavior.
- Does NOT do any retry logic or global redirect-on-401 (there's no 401
  yet — no security layer).

=== MODELS (`core/models/`) ===
One file per domain, TypeScript interfaces mirroring the backend's
actual response/request DTOs field-for-field (same field names — this
was called out explicitly in the backend plan so the two sides don't
need mapping layers). At minimum:

- `auth.model.ts` — `LoginRequest`, `LoginResponse`,
  `RegisterTouristRequest`, `RegisterProviderRequest`,
  `RegisterGuideRequest`
- `user.model.ts` — `UserStatus` union type
  (`'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'REVOKED'`),
  `AdminUserResponse`, `UpdateUserStatusRequest`
- `service-slot.model.ts` — `ServiceCategory` union type (all 11
  values), `ServiceSlotResponse`, `CreateServiceSlotRequest`,
  `UpdateServiceSlotRequest`, `ServiceSlotSearchRequest`
  (all fields optional — this becomes query params, not a body)
- `guide-availability.model.ts` — `GuideAvailabilityResponse`,
  `CreateGuideAvailabilityRequest`, `GuideAvailabilitySearchRequest`
- `booking.model.ts` — `BookingResponse`, `CreateBookingRequest`,
  `BookingStatus` union, `PaymentStatus` union
- `guide-booking.model.ts` — `GuideBookingResponse`,
  `CreateGuideBookingRequest`, `GuideBookingStatus` union
- `group.model.ts` — `GroupResponse`, `CreateGroupRequest`,
  `JoinGroupRequest`, `GroupMemberResponse`,
  `GroupMemberStatus` union
- `rating.model.ts` — `GuideRatingResponse`,
  `CreateGuideRatingRequest`, `ServiceRatingResponse`,
  `CreateServiceRatingRequest`
- `payment.model.ts` — `PaymentResponse`, `PaymentSearchRequest`,
  `PaymentMethod` union, `PaymentStatus` union (reuse if already
  defined in booking.model.ts, don't duplicate)
- `commission.model.ts` — `CommissionResponse`,
  `CommissionSearchRequest`, `SettlementStatus` union
- `admin-reports.model.ts` — `RevenueSummaryResponse`,
  `BookingsSummaryResponse`, `CommissionSummaryResponse`
- `api-error.model.ts` — `ApiError { timestamp, status, message,
  errors?: Record<string, string> }`

=== SERVICES (`core/services/`) ===
One `@Injectable({ providedIn: 'root' })` service per domain, using
`inject(HttpClient)` (not constructor injection — match modern Angular
style already in use in the project; check and follow whatever pattern
the existing mock services use if they're already on this style).
Every method returns a typed `Observable<T>` — no `any`. Build query
params for search/filter endpoints with `HttpParams`, only appending
params that are actually set (don't send empty strings for unset
filters).

- `AuthService`: `registerTourist()`, `registerProvider()`,
  `registerGuide()`, `login()` → `POST /api/auth/login` (wire this into
  the existing session-switching mechanism as the real data source).
- `ProviderService`: `getById()`, `update()`.
- `GuideService`: `getById()`, `update()`, `listAvailable()`.
- `ServiceSlotService`: `create()`, `update()`, `delete()`, `getById()`,
  `search(params: ServiceSlotSearchRequest)`, `listByProvider()`.
- `GuideAvailabilityService`: `create()`, `update()`, `delete()`,
  `search(params: GuideAvailabilitySearchRequest)`, `listByGuide()`.
- `BookingService`: `create()`, `listByTourist()`, `listByProvider()`,
  `updateStatus()`.
- `GuideBookingService`: `create()`, `listByGuide()`, `listByTourist()`,
  `updateStatus()`, `markPaymentReceived()`.
- `GroupService`: `create()`, `joinByCode()`, `listMembers()`,
  `removeMember()`, `createGroupBooking()`.
- `RatingService`: `rateGuide()`, `getGuideRatings()`,
  `rateService()`, `getProviderRatings()`.
- `PaymentService`: `getById()`, `getByBooking()`, `updateStatus()`.
- `AdminService`: `getPendingRegistrations()`, `verifyProvider()`,
  `verifyGuide()`, `listUsers(filters)`, `updateUserStatus()`,
  `listPayments(filters)`, `listCommissions(filters)`,
  `settleCommission()`, `getRevenueSummary()`,
  `getBookingsSummary()`, `getCommissionSummary()`.

Base each method's endpoint path exactly on this list (already
confirmed against the backend controllers — don't guess alternates):

  POST /api/auth/register/tourist|provider|guide
  POST /api/auth/login
  GET/PUT  /api/providers/{id}
  GET/PUT  /api/guides/{id}
  GET      /api/guides?available=true
  POST /api/slots , PUT/DELETE/GET /api/slots/{id}
  GET  /api/slots/search?category=&origin=&destination=&locationName=&dateFrom=&dateTo=&minPrice=&maxPrice=
  GET  /api/slots/provider/{providerId}
  POST /api/guide-availability , PUT/DELETE /api/guide-availability/{id}
  GET  /api/guide-availability/search?dateFrom=&dateTo=&location=
  GET  /api/guide-availability/guide/{guideId}
  POST /api/bookings
  GET  /api/bookings/tourist/{touristId}
  GET  /api/bookings/provider/{providerId}
  PUT  /api/bookings/{id}/status
  POST /api/guide-bookings
  GET  /api/guide-bookings/guide/{guideId}
  GET  /api/guide-bookings/tourist/{touristId}
  PUT  /api/guide-bookings/{id}/status
  PUT  /api/guide-bookings/{id}/payment-received
  POST /api/groups
  POST /api/groups/join
  GET  /api/groups/{id}/members
  DELETE /api/groups/{id}/members/{touristId}
  POST /api/groups/{id}/booking
  POST /api/ratings/guide , GET /api/ratings/guide/{guideId}
  POST /api/ratings/service , GET /api/ratings/provider/{providerId}
  GET  /api/payments/{id}
  GET  /api/payments/booking/{bookingId}
  PUT  /api/payments/{id}/status
  GET  /api/admin/pending-registrations
  PUT  /api/admin/providers/{id}/verify
  PUT  /api/admin/guides/{id}/verify
  GET  /api/admin/users?role=&status=
  PUT  /api/admin/users/{id}/status
  GET  /api/admin/payments?dateFrom=&dateTo=&status=&method=
  GET  /api/admin/commissions?dateFrom=&dateTo=&settlementStatus=
  PUT  /api/admin/commissions/{id}/settle
  GET  /api/admin/reports/revenue-summary?dateFrom=&dateTo=
  GET  /api/admin/reports/bookings-summary?dateFrom=&dateTo=
  GET  /api/admin/reports/commission-summary?dateFrom=&dateTo=

=== SUBSCRIBE / RXJS USAGE — FOLLOW THESE PATTERNS ===
- Prefer the `async` pipe in templates over manual `.subscribe()` in
  the component wherever the data just needs to be displayed — this
  avoids manual unsubscribe management entirely. Use this as the
  default for list/detail pages.
- When a manual `.subscribe()` is genuinely needed (form submissions,
  triggering a side effect, imperative navigation on success), inject
  `DestroyRef` and pipe every subscription through
  `takeUntilDestroyed(destroyRef)` — do not leave subscriptions
  unmanaged, and do not use the deprecated `takeUntil(this.destroy$)`
  Subject pattern in new code.
- Never nest `.subscribe()` calls to chain dependent requests. Use
  `switchMap` (most common — e.g. create a booking, then fetch the
  updated list), `concatMap` (when order matters and must not
  overlap), or `forkJoin` (when multiple independent requests all need
  to complete before proceeding, e.g. loading a dashboard).
- Every subscription that can fail must handle the error explicitly —
  either a second `error` callback in `.subscribe({ next, error })` or
  a `catchError` in the pipe — never a bare `.subscribe(data => ...)`
  with no error path. Route the normalized `ApiError` into whatever
  the page's existing error-state mechanism is.
- For search/filter pages, debounce user input
  (`debounceTime(300)` + `distinctUntilChanged()`) before calling the
  search service method, and use `switchMap` so a fast-typing user's
  stale in-flight request gets cancelled by the newest one.
- Set a loading flag/signal immediately before subscribing and clear
  it in both the `next` and `error` callbacks (or via `finalize()` in
  the pipe) so the loading state can't get stuck on error.
- Keep components thin: a component method should build the request
  object, call the service, and route the result into local
  state/signals — no HTTP-specific logic (headers, param building,
  URL construction) outside the service layer.

=== SWAPPING MOCK SERVICES FOR REAL ONES ===
For each existing mock domain data service, either:
(a) replace its internals to delegate to the new real service while
    keeping the same public method signatures, if that keeps changes
    localized to one file per domain, or
(b) if signatures genuinely can't match (e.g. mock methods were
    synchronous and returned arrays directly instead of Observables),
    update call sites too — but tell me which services need this
    before doing it, since it touches more files.
Keep the mock session/role-switching logic itself intact; only
`AuthService.login()` becomes real, as noted above.

Ask me before making structural assumptions that affect multiple
components (e.g. whether to keep resolvers doing eager data loading vs.
moving everything to component-level loading + async pipe), but don't
stop for small implementation details — use your best judgment and
note anything worth revisiting in your final summary.
```

---

### A few notes before you run this

- **`async` pipe first, manual `subscribe` only when needed.** This is
  the biggest single "industry practice" lever for an Angular HTTP
  layer — most memory-leak and stale-loading-state bugs in Angular
  apps come from manual subscriptions that never got torn down. The
  instructions push Claude Code toward the pipe by default and toward
  `takeUntilDestroyed` (not the older `Subject`-based teardown pattern)
  when a manual subscribe is genuinely required.
- **The interceptor normalizes errors; it doesn't handle them.**
  Keeping `ApiError` mapping in one interceptor instead of having every
  service `catchError` reach into `error.error.message` by hand means
  the shape only has to match the backend's
  `GlobalExceptionHandler` output in one place.
- **Endpoint paths are pinned to the actual backend controllers** from
  your v2 backend instructions, not re-derived from scratch — this
  avoids the frontend and backend drifting on route naming, which is a
  common source of silent 404s.
- **Route guards are explicitly left alone.** Since the backend still
  has no security layer, a real guard would be guarding against
  nothing — so the mock session-switching mechanism your Phase 1/2 plan
  already built keeps doing that job until the real security phase.
- **The provider multi-category flag from the backend gap list matters
  here too.** If you had Claude Code switch `ServiceProvider.category`
  to a `Set<ServiceCategory>` on the backend, make sure
  `RegisterProviderRequest` and any provider-profile-edit form on the
  frontend send/receive a `categories` array, not a single string —
  worth double-checking once both sides are wired together.
