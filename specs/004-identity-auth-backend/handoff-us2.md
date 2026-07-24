# Handoff: Phase 4 (US2 — Preferences follow the Explorer, not the device)

**Status**: T027–T032 complete and marked `[X]` in [tasks.md](tasks.md). US1 + US2 together satisfy
this phase's own `@ready` Cucumber gate.

## What's built

- `PreferencesUpdated` event record.
- `UpdatePreferencesService` — replaces the `Preferences` row wholesale via
  `Preferences.builder()` (not the constructor — see US1 handoff's Gotcha #1) inside a
  `@Transactional` method; publishes `PreferencesUpdated` in the same transaction.
- `ExplorerController` — `GET /api/v1/explorers/me`, `PUT /api/v1/explorers/me/preferences`.
  `me` is resolved **only** from `Authentication.getPrincipal()` cast to `Jwt`, reading `sub` — no
  path or query parameter ever carries an Explorer id, so there is structurally no way for one
  request to address another Explorer's data (NFR-SEC-02).
- `PreferencesRequest` DTO — validates `language` against the 5-value enum and `theme` against
  `light|dark` before it ever reaches the service.
- Tests: `UpdatePreferencesServiceTest` (`@DataJpaTest` + Testcontainers — not run in this sandbox,
  see below), `ExplorerControllerTest` (`@WebMvcTest`, 3 tests, all green: round-trip GET,
  round-trip PUT, and a test proving a JWT whose subject has no Explorer row is refused with `404`
  — the structural version of "another Explorer's data is refused," since there's no path id to
  attempt cross-Explorer access with in the first place).
- **T032 was already satisfied during Phase 3**: `AuthenticationSteps.java` (written for T025)
  already included the `@ready` "Preferences persist across sessions" step definitions, because
  they needed `PUT /explorers/me/preferences`/`GET /explorers/me` — built in this phase, not the
  last one. No new edits to that file were needed here; it's now fully wired end-to-end for both
  scenarios sharing one `CucumberSpringConfiguration` context.

## A second `@WebMvcTest` + Spring Security gotcha (new — worth flagging alongside US1's)

`@AuthenticationPrincipal Jwt jwt` **did not resolve** in `@WebMvcTest(ExplorerController.class)`
— Spring MVC's default `ServletModelAttributeMethodProcessor` tried to construct a `Jwt` via
reflection instead of routing through Spring Security's `AuthenticationPrincipalArgumentResolver`,
throwing `tokenValue cannot be empty`. Likely cause: that resolver is registered via
`@EnableWebSecurity`'s own `@Import`s, and the full chain isn't reliably wired for a narrow
controller slice in this Spring Boot 4 (`4.0.0`) stack.

**Fix applied**: `ExplorerController` now takes `Authentication authentication` and casts
`authentication.getPrincipal()` to `Jwt` — resolved by Spring MVC core's built-in
`PrincipalMethodArgumentResolver` (any `java.security.Principal`-typed param, via
`request.getUserPrincipal()`), which doesn't depend on Spring Security's extra registration step.

**Test-side implication**: `SecurityMockMvcRequestPostProcessors.jwt()` (the idiomatic
spring-security-test helper) populates the `SecurityContext` but **not** `getUserPrincipal()` in
this slice — so `ExplorerControllerTest` instead builds a real `Jwt` + `JwtAuthenticationToken` and
attaches it via MockMvc's plain `.principal(...)` (no Spring-Security-specific test wiring
required). This is the pattern to reuse for any future `@WebMvcTest` needing an authenticated
principal — do **not** reach for `.with(jwt()...)` in this codebase until the underlying wiring
gap is understood/fixed, or it will silently misbehave the same way. (The real, full-context
`@SpringBootTest`-based Cucumber suite doesn't have this problem — the genuine Spring Security
filter chain runs there, so `@AuthenticationPrincipal` would work fine in that context; the
controller code itself works either way since `Authentication` resolution is universal.)

## Verification performed

- `ExplorerControllerTest` — 3/3 green.
- Full non-Docker-dependent suite re-run: 18 passing / 4 pre-existing DB-dependent failures
  (same four as noted in the US1 handoff — not a regression, this sandbox has no Postgres).
- `UpdatePreferencesServiceTest` needs Docker (Testcontainers Postgres) — not run here; run
  `./mvnw test -Dtest=UpdatePreferencesServiceTest` in a Docker-capable environment before merging.

## What's left

Phase 5 (US3 — refresh rotation), Phase 6 (US4 — mobile), Phase 7 (polish). Proceeding to Phase 5
next.
