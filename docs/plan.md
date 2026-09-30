# Horizon UI Scaffold Plan

## Phase 1 (done)
- Inspect Angular workspace version/config.
- Install and wire Bootstrap + Bootstrap Icons with SCSS theme overrides.
- Validate build and confirm Bootstrap classes compile with Horizon theme values.
- Parse UML activity diagram swimlanes and decision points.

## Phase 2 (waiting for user confirmation)
- Confirm folder structure under `src/app/`.
- Confirm route/page map for all four roles derived from diagram.
- Clarify structural assumptions (slot form strategy across categories).

## Phase 3 (implementation order)
1. Tourist flow scaffold + build validation
2. Service Provider Admin flow scaffold + build validation
3. Tour Guide flow scaffold + build validation
4. System Admin flow scaffold + build validation

## Cross-cutting during implementation
- Standalone components only
- Built-in Angular control flow syntax (`@if`, `@for`, `@switch`)
- Role-guarded lazy route groups
- Mock auth/session switching + mock domain data services
- Loading/empty/error states for list pages
- Reactive form validation for all form pages
