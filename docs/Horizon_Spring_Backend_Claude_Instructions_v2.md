# Claude-in-VS-Code Instructions — Horizon Spring Boot Backend Scaffold (v2, gap-corrected)

Paste everything inside the fenced block below into Claude inside VS Code,
with your generated Spring Initializr project ("Horizon") open as the
workspace. It assumes the project already has Spring Web, Spring Data JPA,
PostgreSQL Driver, Validation, and Lombok as dependencies — no Spring
Security and no WebSocket dependency needed for this phase.

This version supersedes the original instructions. It folds in twelve
gaps a review pass found against the Angular frontend (guide availability
posting, group invite flow, service ratings, status transition rules,
payment/commission visibility, admin reporting, role/status management,
non-transport slot locations, rejection reasons, a tracking-ready schema
stub, fuller guide profile fields, and multi-category provider support).
Security and WebSockets remain explicitly out of scope for this phase.

```
You are working inside an existing Spring Boot (Maven) project called
"Horizon" — the backend for an all-in-one tourism booking platform with
four user roles: SYSTEM ADMIN, SERVICE PROVIDER, TOUR GUIDE, and TOURIST.
Scaffold the initial backend package structure, JPA entities, repositories,
DTOs, services, and REST controllers based on the spec below. Use
PostgreSQL as the database.

=== SCOPE FOR THIS PHASE (explicit boundaries) ===
- NO Spring Security, NO JWT, NO route protection of any kind. Every
  endpoint is open. "Login" is a plain, unauthenticated POST endpoint that
  checks email/password against the database and returns the matched
  user's data — this is a demo login only, to be replaced with real
  Spring Security in a later phase.
- NO WebSocket, NO real-time GPS broadcasting logic. We DO add a small
  schema stub now (see LastKnownLocation below) so the future tracking
  phase doesn't require a migration, but write zero live-tracking logic,
  no WebSocket config, no scheduled jobs — schema only.
- DO build full CRUD + search/filter REST APIs for everything else
  (registration, service slots, guide availability, bookings, groups,
  ratings, payments, commissions, admin reporting) — that's the actual
  goal of this phase.
- Passwords: store them hashed using `spring-security-crypto`'s
  `BCryptPasswordEncoder` ONLY (add just that one artifact, not the full
  Spring Security starter). If you'd rather keep it fully plain for
  simplicity at this stage, tell me why before doing it — don't silently
  skip hashing.

=== DATABASE CONFIGURATION ===
- Configure `application.yml` (convert from application.properties if
  needed) for PostgreSQL: datasource URL, username, password (use
  placeholders + a comment telling me to fill in my local Postgres
  credentials, don't invent real ones), driver-class-name
  `org.postgresql.Driver`.
- JPA settings: `spring.jpa.hibernate.ddl-auto: update` for this
  prototyping phase (explicitly comment in the file that this should
  become `validate` + Flyway migrations before production),
  `spring.jpa.show-sql: true` and `properties.hibernate.format_sql: true`
  during development.
- Set up CORS in a `config/CorsConfig.java` (a `WebMvcConfigurer` bean)
  allowing requests from `http://localhost:4200` with all methods/headers
  needed for a typical REST + JSON app.
- Add a `config/DataSeeder.java` (`CommandLineRunner`) that, on startup,
  inserts one demo user per role IF the users table is empty:
    - admin@horizon.demo    / demo1234  (ADMIN)
    - provider@horizon.demo / demo1234  (SERVICE_PROVIDER) — plausible
      sample business profile, verificationStatus APPROVED
    - guide@horizon.demo    / demo1234  (TOUR_GUIDE) — plausible sample
      guide profile (see expanded TourGuide fields below), verified
    - tourist@horizon.demo  / demo1234  (TOURIST)
  Also seed one open ServiceSlot and one open GuideAvailability row so the
  search/browse pages have data to render immediately.

=== PACKAGE STRUCTURE ===
Base package: `com.horizon.backend` (adjust to whatever Spring Initializr
actually generated — check first, don't assume). Create:

- `entity/` — JPA entities
- `repository/` — Spring Data JPA repositories
- `dto/request/` and `dto/response/` — request/response DTOs, never expose
  entities directly through controllers
- `service/` and `service/impl/` — interface + implementation per domain
- `controller/` — REST controllers
- `exception/` — custom exceptions + a global `@ControllerAdvice` handler
- `config/` — CorsConfig, DataSeeder, and any other app-level config

Confirm this structure with me (and the actual base package name) before
generating files.

=== ENTITIES ===
Use Lombok @Getter/@Setter/@NoArgsConstructor/@AllArgsConstructor/@Builder,
not manual boilerplate.

**User (abstract base)**
Fields: id (UUID or Long, your call — tell me which and why), fullName,
email (unique, not null), passwordHash, phone, address, status (enum:
ACTIVE, PENDING_VERIFICATION, SUSPENDED, REVOKED — REVOKED added so admin
can hard-disable an account distinct from a temporary suspension),
createdAt (auto-set).
Use `@Inheritance(strategy = InheritanceType.JOINED)` with
`@DiscriminatorColumn(name = "role")` so each role gets its own properly
normalized table joined back to a shared `users` table.

**Admin extends User** — no extra fields needed yet beyond User.

**ServiceProvider extends User** — businessName, tradeLicenseNo,
verificationStatus (enum: PENDING, APPROVED, REJECTED), rejectionReason
(String, nullable — populated when verificationStatus is REJECTED so the
applicant can see why), commissionRate (BigDecimal), ratingAvg (double,
default 0), ratingCount (int, default 0).
Category: model as `@ElementCollection Set<ServiceCategory> categories`
(a join table `provider_categories`) rather than a single field — a
provider commonly runs slots across more than one category (e.g. a
transport company running both BUS and MICROBUS). FLAG THIS FOR ME
EXPLICITLY before implementing: tell me you're switching from single
category to a set and confirm I'm fine with it, since it's a structural
change from the original plan.

**TourGuide extends User** — nationalId, bio (text), ratingAvg (double,
default 0), ratingCount (int, default 0), isAvailable (boolean, default
true), verificationStatus (enum: PENDING, APPROVED, REJECTED),
rejectionReason (String, nullable), languages (`@ElementCollection
List<String>`, join table `guide_languages`), location (String — guide's
base city/area), experienceYears (int, default 0), defaultPrice
(BigDecimal — guide's standard day rate), negotiable (boolean, default
true). These five extra fields close the gap against the frontend's
apply/browse-guides forms, which already collect them.

**Tourist extends User** — loyaltyPoints (int, default 0).

**ServiceCategory (enum)** — BUS, MICROBUS, LAUNCH, TRAIN, AIRPLANE, SHIP,
HOTEL, RESORT, CONVENTION_CENTER, BUFFET, AMUSEMENT_PARK.

**ServiceSlot** — id, provider (ManyToOne → ServiceProvider), category,
origin (nullable), destination (nullable), locationName (String,
nullable — venue/site name, used instead of origin/destination for the
five non-transport categories: HOTEL, RESORT, CONVENTION_CENTER, BUFFET,
AMUSEMENT_PARK), startDateTime, endDateTime, capacity (int),
availableSeats (int), price (BigDecimal), status (enum: OPEN, FULL,
CLOSED, CANCELLED). Add a service-layer validation rule (not a DB
constraint): transport categories require origin+destination,
non-transport categories require locationName — document this in a
comment on the entity and enforce it in ServiceSlotService.

**GuideAvailability** — id, tourGuide (ManyToOne → TourGuide), date,
startTime, endTime, location (String), notes (text, nullable), status
(enum: OPEN, BOOKED, CANCELLED). This is the guide-side "broadcast" slot
that was missing from the original plan — guides post these, tourists
browse them, and a GuideBooking can optionally reference one.

**Booking** — id, tourist (ManyToOne → Tourist), serviceSlot (ManyToOne →
ServiceSlot), bookingDate (auto-set), status (enum: PENDING, CONFIRMED,
CANCELLED, COMPLETED), totalAmount (BigDecimal), paymentStatus (enum:
UNPAID, PAID, REFUNDED).
Document this state-transition contract as code comments on
BookingService (no separate entity needed):
  - Booking is created as PENDING / UNPAID; availableSeats decrements
    immediately on creation (optimistic hold), not on payment.
  - Booking moves PENDING → CONFIRMED only when Payment for it reaches
    SUCCESS (triggered from PaymentService, not settable directly by any
    controller endpoint other than the payment-status update).
  - Booking moves to CANCELLED via explicit
    `PUT /api/bookings/{id}/status`; cancelling a PENDING or CONFIRMED
    booking restores availableSeats and, if paymentStatus was PAID, sets
    paymentStatus to REFUNDED (actual refund processing is out of scope,
    just the status bookkeeping).
  - Booking moves to COMPLETED only after serviceSlot.endDateTime has
    passed and status was CONFIRMED — admin- or scheduler-triggerable via
    the status endpoint for now, no automatic job in this phase.

**Group** — id, groupName, createdBy (ManyToOne → Tourist), joinCode
(String, unique, auto-generated short code), booking (OneToOne →
Booking, nullable until the group books shared transport), createdAt.
Replace the plain ManyToMany from the original plan with an explicit
join entity so membership has state:

**GroupMember** — id, group (ManyToOne → Group), tourist (ManyToOne →
Tourist), status (enum: INVITED, JOINED, DECLINED), joinedAt (nullable
until JOINED). Unique constraint on (group, tourist).

**GuideBooking** — id, tourist (ManyToOne → Tourist), tourGuide (ManyToOne
→ TourGuide), guideAvailability (ManyToOne → GuideAvailability, nullable
— set when the tourist booked against a posted slot rather than a
freeform negotiated request), scheduleDate, agreedPrice (BigDecimal),
isNegotiated (boolean), status (enum: REQUESTED, ACCEPTED, DECLINED,
COMPLETED), paymentReceived (boolean, default false).
When a GuideBooking referencing a GuideAvailability moves to ACCEPTED,
the service layer should flip that GuideAvailability's status to BOOKED;
if the GuideBooking is later DECLINED, flip it back to OPEN.

**Payment** — id, amount (BigDecimal), method (enum: CARD,
MOBILE_BANKING, CASH), status (enum: PENDING, SUCCESS, FAILED, REFUNDED),
transactionDate, and EITHER a booking OR a guideBooking reference
(nullable OneToOne to each — a payment belongs to exactly one of the two;
add a check/comment noting this constraint, don't over-engineer a
polymorphic solution here).

**Commission** — id, booking (OneToOne → Booking), percentage
(BigDecimal), amount (BigDecimal), calculatedDate, settlementStatus
(enum: PENDING, SETTLED — added so admin can distinguish commission
that's been calculated from commission that's actually been paid out to
Horizon).

**GuideRating** — id, guideBooking (ManyToOne → GuideBooking), score
(int, 1–5), comment (text, nullable), ratedDate. (Renamed from the
original plan's generic `Rating` — it only ever rated guides, so the name
should say so now that ServiceRating exists as a sibling.)

**ServiceRating** — id, booking (ManyToOne → Booking), tourist (ManyToOne
→ Tourist), provider (ManyToOne → ServiceProvider), score (int, 1–5),
comment (text, nullable), ratedDate. New entity — the frontend's
rate-services page implies rating providers/slots, not just guides, and
the original plan had no way to store that. On save, recalculate and
persist ServiceProvider.ratingAvg/ratingCount (same pattern TourGuide
already needs for GuideRating).

**LastKnownLocation** — id, tourGuide (OneToOne → TourGuide), latitude
(double, nullable), longitude (double, nullable), updatedAt (nullable).
Also add `gpsEnabled` (boolean, default false) to TourGuide. This is
schema-only groundwork for the future WebSocket/live-tracking phase —
write no logic that populates or reads it yet, no endpoints, just the
table so that phase doesn't need a migration.

Add `@Column(nullable = false)` / `@NotNull` etc. appropriately based on
what's genuinely required vs optional per the description above.

=== REPOSITORIES ===
One `JpaRepository<Entity, IdType>` interface per entity. Beyond default
CRUD, add:

- `UserRepository`: `findByEmail(String email)`
- `ServiceProviderRepository`: `findByVerificationStatus(...)`
- `TourGuideRepository`: `findByIsAvailable(boolean)`,
  `findByVerificationStatus(...)`
- `ServiceSlotRepository`: search via `JpaSpecificationExecutor`
  (category, origin, destination, locationName, date range, price range,
  status) — not a combinatorial pile of derived methods.
- `GuideAvailabilityRepository`: `findByTourGuideId(...)`,
  `findByStatus(...)`, plus a Specification-based search (date range,
  location) for the browse-guides page.
- `BookingRepository`: `findByTouristId(...)`,
  `findByServiceSlot_Provider_Id(...)`
- `GuideBookingRepository`: `findByTourGuideId(...)`,
  `findByTouristId(...)`
- `GroupRepository`: `findByJoinCode(...)`, `findByCreatedById(...)`
- `GroupMemberRepository`: `findByGroupId(...)`, `findByTouristId(...)`
- `GuideRatingRepository`: `findByGuideBooking_TourGuideId(...)`
- `ServiceRatingRepository`: `findByProviderId(...)`
- `PaymentRepository`: `findByBookingId(...)`,
  `findByGuideBookingId(...)`, plus a Specification-based search (date
  range, status, method) for the admin ledger view.
- `CommissionRepository`: `findBySettlementStatus(...)`, date-range
  search for the admin summary view.

=== DTOs (request/response — controllers never accept or return entities) ===
Build these at minimum:
- `RegisterTouristRequest`, `RegisterProviderRequest` (now includes a
  `Set<ServiceCategory> categories`), `RegisterGuideRequest` (now
  includes languages, location, experienceYears, defaultPrice,
  negotiable) — each with only the fields relevant to that role's form.
- `LoginRequest` / `LoginResponse` (user id, name, email, role,
  role-specific summary fields — no password hash, ever).
- `CreateServiceSlotRequest` / `UpdateServiceSlotRequest` (both include
  locationName) / `ServiceSlotResponse`
- `ServiceSlotSearchRequest` (category, origin, destination,
  locationName, dateFrom, dateTo, minPrice, maxPrice — all optional)
- `CreateGuideAvailabilityRequest` / `GuideAvailabilityResponse` /
  `GuideAvailabilitySearchRequest` (dateFrom, dateTo, location)
- `CreateBookingRequest` / `BookingResponse`
- `CreateGuideBookingRequest` / `GuideBookingResponse`
- `CreateGroupRequest` / `GroupResponse` (includes joinCode and member
  list) / `JoinGroupRequest` (joinCode) / `GroupMemberResponse`
- `CreateGuideRatingRequest` / `GuideRatingResponse`
- `CreateServiceRatingRequest` / `ServiceRatingResponse`
- `PaymentResponse` / `PaymentSearchRequest` (dateFrom, dateTo, status,
  method — for the admin ledger)
- `CommissionResponse` / `CommissionSearchRequest` (dateFrom, dateTo,
  settlementStatus)
- `VerifyProviderRequest` / `VerifyGuideRequest` (approved: boolean,
  rejectionReason: nullable String, required when approved=false)
- `AdminUserResponse` (id, name, email, role, status) / `UpdateUserStatusRequest`
- `RevenueSummaryResponse`, `BookingsSummaryResponse`,
  `CommissionSummaryResponse` — plain aggregate DTOs (counts, sums,
  date-bucketed if straightforward, don't over-build this)
- Add validation annotations (`@NotBlank`, `@Email`, `@Positive`,
  `@Future` where a date must be in the future, etc.) on every request
  DTO.

=== SERVICES ===
One interface + implementation per domain:
`AuthService`, `ServiceProviderService`, `TourGuideService`,
`TouristService`, `ServiceSlotService` (create, update, cancel, search;
enforce the origin/destination-vs-locationName rule per category),
`GuideAvailabilityService` (create, update, cancel, search, flip status
on booking accept/decline), `BookingService` (create — check
availability, decrement seats, enforce the status/paymentStatus
transition rules above; list by tourist/provider), `GuideBookingService`
(same transition discipline, plus availability status sync),
`GroupService` (create, generate joinCode, join-by-code, list/leave
members, attach a Booking once the group books shared transport),
`GuideRatingService`, `ServiceRatingService` (both recalc the relevant
ratingAvg/ratingCount on save), `PaymentService` (create/update status;
on status → SUCCESS, flip the linked Booking/GuideBooking accordingly),
`CommissionService` (auto-calculate on Booking CONFIRMED, list/settle),
`AdminService` (approve/reject provider or guide verification with
rejectionReason, list pending registrations, list/filter all users,
update a user's status including REVOKED), `AdminReportService` (revenue
summary, bookings summary, commission summary — simple aggregate
queries, date-range filterable).
Throw custom exceptions (`ResourceNotFoundException`,
`DuplicateEmailException`, `SlotUnavailableException`,
`InvalidJoinCodeException`, `InvalidStatusTransitionException`, etc.)
from the service layer rather than returning nulls or generic errors.

=== CONTROLLERS ===
REST controllers under `/api/...`, thin, delegating to services:
- `POST /api/auth/register/tourist|provider|guide`, `POST /api/auth/login`
- `GET /api/providers/{id}`, `PUT /api/providers/{id}`
- `GET /api/guides/{id}`, `PUT /api/guides/{id}`,
  `GET /api/guides?available=true`
- `POST /api/slots`, `PUT /api/slots/{id}`, `DELETE /api/slots/{id}`,
  `GET /api/slots/{id}`,
  `GET /api/slots/search?category=&origin=&destination=&locationName=&dateFrom=&dateTo=&minPrice=&maxPrice=`,
  `GET /api/slots/provider/{providerId}`
- `POST /api/guide-availability`, `PUT /api/guide-availability/{id}`,
  `DELETE /api/guide-availability/{id}`,
  `GET /api/guide-availability/search?dateFrom=&dateTo=&location=`,
  `GET /api/guide-availability/guide/{guideId}`
- `POST /api/bookings`, `GET /api/bookings/tourist/{touristId}`,
  `GET /api/bookings/provider/{providerId}`,
  `PUT /api/bookings/{id}/status`
- `POST /api/guide-bookings`, `GET /api/guide-bookings/guide/{guideId}`,
  `GET /api/guide-bookings/tourist/{touristId}`,
  `PUT /api/guide-bookings/{id}/status`,
  `PUT /api/guide-bookings/{id}/payment-received`
- `POST /api/groups`, `POST /api/groups/join`,
  `GET /api/groups/{id}/members`, `DELETE /api/groups/{id}/members/{touristId}`,
  `POST /api/groups/{id}/booking`
- `POST /api/ratings/guide`, `GET /api/ratings/guide/{guideId}`
- `POST /api/ratings/service`, `GET /api/ratings/provider/{providerId}`
- `GET /api/payments/{id}`, `GET /api/payments/booking/{bookingId}`,
  `PUT /api/payments/{id}/status`
- `GET /api/admin/pending-registrations`,
  `PUT /api/admin/providers/{id}/verify`,
  `PUT /api/admin/guides/{id}/verify`,
  `GET /api/admin/users?role=&status=`, `PUT /api/admin/users/{id}/status`,
  `GET /api/admin/payments?dateFrom=&dateTo=&status=&method=`,
  `GET /api/admin/commissions?dateFrom=&dateTo=&settlementStatus=`,
  `PUT /api/admin/commissions/{id}/settle`,
  `GET /api/admin/reports/revenue-summary?dateFrom=&dateTo=`,
  `GET /api/admin/reports/bookings-summary?dateFrom=&dateTo=`,
  `GET /api/admin/reports/commission-summary?dateFrom=&dateTo=`

Return proper HTTP status codes (201 on create, 404 via the exception
handler when not found, 400 on validation errors with a clear error body
shape, 409 on invalid status transitions or duplicate join attempts,
200/204 as appropriate elsewhere).

=== EXCEPTION HANDLING ===
Build `exception/GlobalExceptionHandler.java` with `@RestControllerAdvice`
handling: `ResourceNotFoundException` → 404, `DuplicateEmailException` →
409, `MethodArgumentNotValidException` → 400 with a field-level error
map, `SlotUnavailableException` → 409, `InvalidJoinCodeException` → 404,
`InvalidStatusTransitionException` → 409, and a catch-all → 500 with a
generic safe message (don't leak stack traces). Return a consistent error
response shape (`timestamp`, `status`, `message`, `errors` if applicable)
across all of them.

=== BEFORE YOU START ===
1. Confirm the actual base package name and Java version from the
   generated project (don't assume `com.horizon.backend`).
2. Show me the package structure and entity list above translated into
   actual file names/paths before generating anything.
3. Build in this order and give me a short summary after each stage so I
   can review before you continue: (1) DB config + CorsConfig, (2)
   entities + repositories, (3) DataSeeder, (4) DTOs, (5) services +
   exceptions, (6) controllers.
4. After each stage, run `mvn compile` (or the equivalent) and fix any
   errors before moving to the next stage.

Ask me before making structural assumptions that affect multiple layers
(e.g. UUID vs Long primary keys, single- vs multi-category providers, how
Payment should relate to Booking vs GuideBooking), but don't stop for
small implementation details — use your best judgment and note anything
worth revisiting in your final summary.
```

---

### What changed vs. the original plan, and why

- **GuideAvailability is new.** The original plan only modeled the
  tourist-initiated `GuideBooking` (a request/negotiation record). It had
  no entity for a guide proactively posting open dates the way
  `post-schedule.ts` implies on the frontend. `GuideBooking` now
  optionally references a `GuideAvailability` so both flows — direct
  negotiated request and book-a-posted-slot — share the same booking
  pipeline.
- **Group membership is now a real entity, not a bare ManyToMany.** A
  join-code invite flow needs somewhere to hang per-member status
  (`INVITED` / `JOINED` / `DECLINED`), so `GroupMember` replaces the
  plain join table, and `Group` gained a unique `joinCode`.
- **Ratings split into `GuideRating` and `ServiceRating`.** The original
  `Rating` entity only ever pointed at `GuideBooking`, but
  `rate-services.ts` on the frontend clearly rates providers/slots too.
  `ServiceProvider` gained `ratingAvg`/`ratingCount` to mirror what
  `TourGuide` already had.
- **Booking/payment state transitions are now written down explicitly**
  as a contract on `BookingService`, rather than left implicit. This
  matters most for who's allowed to move `PENDING → CONFIRMED` (only a
  successful `Payment`, never a raw status PUT).
- **Payment and Commission are now visible, not just written.** Added
  read endpoints (`/api/payments/...`, `/api/admin/payments`,
  `/api/admin/commissions`) and a `settlementStatus` on `Commission` so
  admin can tell calculated-but-unpaid commission from settled
  commission.
- **Admin reporting exists now.** Three summary endpoints
  (revenue/bookings/commission) with date-range filters — intentionally
  simple aggregate queries, not a BI layer.
- **User status/role management got real endpoints.** Added `REVOKED` to
  the status enum and `GET/PUT /api/admin/users...` so admin can actually
  browse and act on accounts, not just verify pending providers/guides.
- **`ServiceSlot` gained `locationName`** for the five non-transport
  categories (hotel, resort, convention center, buffet, amusement park)
  that had nowhere to store a site name under the original
  origin/destination-only model.
- **Rejection reasons** were added to both `ServiceProvider` and
  `TourGuide` so a declined applicant can see why, surfaced through
  `VerifyProviderRequest`/`VerifyGuideRequest`.
- **`LastKnownLocation` + `gpsEnabled` are schema-only stubs** for the
  future tracking phase — no logic, no endpoints, just enough structure
  that adding real-time tracking later doesn't require a migration on
  top of a migration.
- **`TourGuide` gained `languages`, `location`, `experienceYears`,
  `defaultPrice`, `negotiable`** to match what the frontend already
  collects at apply-time and displays on browse-guides.
- **Provider category is flagged, not silently changed.** Moving from a
  single `category` field to a `Set<ServiceCategory>` is a structural
  change with downstream effects on registration forms and slot
  creation, so the instructions tell Claude Code to raise it with you
  explicitly rather than assume.

Security and WebSockets remain out of scope on purpose — same as the
original plan — and are the natural next phase once this is stable.
