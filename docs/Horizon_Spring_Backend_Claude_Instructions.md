# Claude-in-VS-Code Instructions — Horizon Spring Boot Backend Scaffold

Paste everything inside the fenced block below into Claude inside VS Code,
with your generated Spring Initializr project ("Horizon") open as the
workspace. It assumes the project already has Spring Web, Spring Data JPA,
PostgreSQL Driver, Validation, and Lombok as dependencies (per our earlier
discussion) — no Spring Security and no WebSocket dependency needed for
this phase.

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
- NO WebSocket, NO real-time GPS tracking logic. Skip anything related to
  live location broadcasting entirely for now — that's a future phase.
- DO build full CRUD + search/filter REST APIs for everything else
  (registration, service slots, bookings, etc.) — that's the actual goal
  of this phase.
- Passwords: store them hashed using `spring-security-crypto`'s
  `BCryptPasswordEncoder` ONLY (add just that one artifact, not the full
  Spring Security starter) so passwords aren't sitting in plaintext in
  Postgres even though there's no login protection yet. If you'd rather
  keep it fully plain for simplicity at this stage, tell me why before
  doing it — don't silently skip hashing.

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
  allowing requests from `http://localhost:4200` (the Angular dev server)
  with all methods/headers needed for a typical REST + JSON app.
- Add a `config/DataSeeder.java` (`CommandLineRunner`) that, on startup,
  inserts one demo user per role IF the users table is empty:
    - admin@horizon.demo   / demo1234  (ADMIN)
    - provider@horizon.demo / demo1234 (SERVICE_PROVIDER) — with a
      plausible sample business profile filled in
    - guide@horizon.demo   / demo1234  (TOUR_GUIDE) — with a plausible
      sample guide profile filled in
    - tourist@horizon.demo / demo1234  (TOURIST)
  This gives me working demo logins immediately without registering
  manually every time I reset the database.

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

=== ENTITIES (derive from this spec; use Lombok @Getter/@Setter/
@NoArgsConstructor/@AllArgsConstructor/@Builder, not manual boilerplate) ===

**User (abstract base)**
Fields: id (UUID or Long, your call — tell me which and why), fullName,
email (unique, not null), passwordHash, phone, address, status (enum:
ACTIVE, PENDING_VERIFICATION, SUSPENDED), createdAt (auto-set).
Use `@Inheritance(strategy = InheritanceType.JOINED)` with
`@DiscriminatorColumn(name = "role")` so each role gets its own properly
normalized table joined back to a shared `users` table — this is the
correct relational approach here, not single-table with a pile of
nullable columns.

**Admin extends User** — no extra fields needed yet beyond User.

**ServiceProvider extends User** — businessName, tradeLicenseNo, category
(enum ServiceCategory — see below), verificationStatus (enum: PENDING,
APPROVED, REJECTED), commissionRate (BigDecimal).

**TourGuide extends User** — nationalId, bio (text), ratingAvg (double,
default 0), isAvailable (boolean, default true).

**Tourist extends User** — loyaltyPoints (int, default 0).

**ServiceCategory (enum)** — BUS, MICROBUS, LAUNCH, TRAIN, AIRPLANE, SHIP,
HOTEL, RESORT, CONVENTION_CENTER, BUFFET, AMUSEMENT_PARK.

**ServiceSlot** — id, provider (ManyToOne → ServiceProvider), category,
origin, destination, startDateTime, endDateTime, capacity (int),
availableSeats (int), price (BigDecimal), status (enum: OPEN, FULL,
CLOSED, CANCELLED).

**Booking** — id, tourist (ManyToOne → Tourist), serviceSlot (ManyToOne →
ServiceSlot), bookingDate (auto-set), status (enum: PENDING, CONFIRMED,
CANCELLED, COMPLETED), totalAmount (BigDecimal), paymentStatus (enum:
UNPAID, PAID, REFUNDED).

**Group** — id, groupName, createdBy (ManyToOne → Tourist), members
(ManyToMany → Tourist, separate join table `group_members`), booking
(OneToOne → Booking, nullable until the group books shared transport).

**GuideBooking** — id, tourist (ManyToOne → Tourist), tourGuide (ManyToOne
→ TourGuide), scheduleDate, agreedPrice (BigDecimal), isNegotiated
(boolean), status (enum: REQUESTED, ACCEPTED, DECLINED, COMPLETED),
paymentReceived (boolean, default false).

**Payment** — id, amount (BigDecimal), method (enum: CARD, MOBILE_BANKING,
CASH), status (enum: PENDING, SUCCESS, FAILED, REFUNDED), transactionDate,
and EITHER a booking OR a guideBooking reference (nullable OneToOne to
each — a payment belongs to exactly one of the two; add a check/comment
noting this constraint, don't over-engineer a polymorphic solution here).

**Commission** — id, booking (OneToOne → Booking), percentage
(BigDecimal), amount (BigDecimal), calculatedDate.

**Rating** — id, guideBooking (ManyToOne → GuideBooking), score (int,
1–5), comment (text, nullable), ratedDate.

Add `@Column(nullable = false)` / `@NotNull` etc. appropriately based on
what's genuinely required vs optional per the description above.

=== REPOSITORIES ===
One `JpaRepository<Entity, IdType>` interface per entity. Beyond the
default CRUD methods, add these derived/custom query methods (this is
where the actual product requirements live):

- `UserRepository`: `findByEmail(String email)`
- `ServiceProviderRepository`: `findByVerificationStatus(...)`
- `TourGuideRepository`: `findByIsAvailable(boolean)`
- `ServiceSlotRepository`: a search method supporting optional filters —
  category, origin, destination, date range, price range, status — use
  Spring Data JPA Specifications (`JpaSpecificationExecutor`) rather than
  a huge combinatorial set of derived-query methods, since the tourist
  search page needs flexible multi-field filtering.
- `BookingRepository`: `findByTouristId(...)`, `findByServiceSlot_Provider_Id(...)`
  (so a provider can see bookings against their own slots)
- `GuideBookingRepository`: `findByTourGuideId(...)`, `findByTouristId(...)`

=== DTOs (request/response — controllers never accept or return entities) ===
Build these at minimum:
- `RegisterTouristRequest`, `RegisterProviderRequest`, `RegisterGuideRequest`
  — each with only the fields relevant to that role's registration form
  (this matters: the provider and guide registration forms have genuinely
  different business fields, don't build one generic "RegisterRequest"
  with everything optional).
- `LoginRequest` (email, password) / `LoginResponse` (user id, name,
  email, role, and role-specific summary fields — no password hash, ever).
- `CreateServiceSlotRequest` / `UpdateServiceSlotRequest` / `ServiceSlotResponse`
- `ServiceSlotSearchRequest` (category, origin, destination, dateFrom,
  dateTo, minPrice, maxPrice — all optional/nullable, used as query params)
- `CreateBookingRequest` / `BookingResponse`
- `CreateGuideBookingRequest` / `GuideBookingResponse`
- Add validation annotations (`@NotBlank`, `@Email`, `@Positive`,
  `@Future` where a date must be in the future, etc.) on every request DTO.

=== SERVICES ===
One interface + implementation per domain, matching the DTOs above:
`AuthService` (register per role, login-lookup), `ServiceProviderService`,
`TourGuideService`, `TouristService`, `ServiceSlotService` (create, update,
delete/cancel, search), `BookingService` (create booking — must check slot
availability and decrement `availableSeats` atomically, list by tourist,
list by provider), `GuideBookingService`, `AdminService` (approve/reject
provider or guide verification, list pending registrations). Throw custom
exceptions (`ResourceNotFoundException`, `DuplicateEmailException`,
`SlotUnavailableException`, etc.) from the service layer rather than
returning nulls or generic errors.

=== CONTROLLERS ===
REST controllers under `/api/...`, one per domain, thin (delegate to
services, map exceptions via the global handler, don't put business logic
in controllers):
- `POST /api/auth/register/tourist|provider|guide`, `POST /api/auth/login`
- `GET /api/providers/{id}`, `PUT /api/providers/{id}`
- `GET /api/guides/{id}`, `PUT /api/guides/{id}`, `GET /api/guides?available=true`
- `POST /api/slots` (provider creates), `PUT /api/slots/{id}`,
  `DELETE /api/slots/{id}`, `GET /api/slots/{id}`,
  `GET /api/slots/search?category=&origin=&destination=&dateFrom=&dateTo=&minPrice=&maxPrice=`
  (this is the tourist-facing search/filter endpoint — make sure every
  parameter is optional and combinable), `GET /api/slots/provider/{providerId}`
- `POST /api/bookings`, `GET /api/bookings/tourist/{touristId}`,
  `GET /api/bookings/provider/{providerId}`, `PUT /api/bookings/{id}/status`
- `POST /api/guide-bookings`, `GET /api/guide-bookings/guide/{guideId}`,
  `GET /api/guide-bookings/tourist/{touristId}`,
  `PUT /api/guide-bookings/{id}/status`,
  `PUT /api/guide-bookings/{id}/payment-received`
- `GET /api/admin/pending-registrations`,
  `PUT /api/admin/providers/{id}/verify`, `PUT /api/admin/guides/{id}/verify`

Return proper HTTP status codes (201 on create, 404 via the exception
handler when not found, 400 on validation errors with a clear error body
shape, 200/204 as appropriate elsewhere).

=== EXCEPTION HANDLING ===
Build `exception/GlobalExceptionHandler.java` with `@RestControllerAdvice`
handling: `ResourceNotFoundException` → 404, `DuplicateEmailException` →
409, `MethodArgumentNotValidException` (Bean Validation failures) → 400
with a field-level error map, `SlotUnavailableException` → 409, and a
catch-all → 500 with a generic safe message (don't leak stack traces).
Return a consistent error response shape (`timestamp`, `status`,
`message`, `errors` if applicable) across all of them.

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
(e.g. UUID vs Long primary keys, or how Payment should relate to Booking
vs GuideBooking), but don't stop for small implementation details — use
your best judgment and note anything worth revisiting in your final
summary.
```

---

### A few notes before you run this

- **The DataSeeder is what makes this immediately testable.** With no
  security layer yet, having four ready-made demo accounts (one per role)
  means you can hit `/api/auth/login` from Postman or your Angular
  services right away, without building a registration flow first just to
  get a user into the database.
- **Specifications over derived query methods for slot search.** The
  tourist-facing "find services" page is the one place where a plain
  `findByCategoryAndOriginAndDestination...` method would spiral out of
  control the moment you add one more optional filter — the instruction
  steers Claude toward `JpaSpecificationExecutor` specifically to avoid
  that.
- **JOINED inheritance, not single-table.** Given Admin/Provider/Guide/
  Tourist have genuinely different fields, this keeps your Postgres schema
  clean (no giant `users` table full of nulls) while still letting you
  query `User` generically where you need to (e.g. the login lookup by
  email across all roles).
- **When you're ready for the Angular side**, the response DTOs here
  (`ServiceSlotResponse`, `BookingResponse`, etc.) are what your Angular
  `HttpClient` services and TypeScript interfaces should mirror — worth
  keeping the field names identical on both sides to avoid mapping
  friction later.
- **Security and WebSockets are deliberately out of scope here** — when
  you're ready for that phase, that's a good moment to revisit the JWT
  dependency and `spring-boot-starter-websocket` we talked about earlier.
