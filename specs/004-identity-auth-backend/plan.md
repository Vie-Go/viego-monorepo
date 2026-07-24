# Implementation Plan: Identity — Live Authentication & Preferences

**Branch**: `004-identity-auth-backend` | **Date**: 2026-07-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-identity-auth-backend/spec.md`

## Summary

Replace the mock/local identity flow `002-theme-components-identity` built with a **live** one:
a visitor signs in with **Email (passwordless one-time code) or Google (verified OIDC ID token)**
and becomes a durable **Explorer** with a system-generated unique **handle**; their **language and
theme preferences** persist server-side and follow them across sessions and devices; **JWT**
access/refresh tokens keep them signed in with automatic renewal and reuse-detected rotation; and
`ExplorerRegistered`/`PreferencesUpdated` are published transactionally so downstream modules can
rely on them. The database schema and JPA entities already exist
([`003-modular-database-schemas`](../003-modular-database-schemas/spec.md)) — this feature adds the
application/security/web layer in front of them and rewires the mobile app's sign-in, register, and
profile/preferences screens off `mobile/app/shared/mock/explorerRepository.ts` onto the real API,
with no mock/local fallback remaining.

Technical approach (full detail in [research.md](research.md)): Spring Security +
`oauth2-resource-server` validating self-issued HS256 JWTs (R1); Nimbus's OIDC SDK verifying Google
ID tokens (R2); a passwordless email one-time-code flow, backed by a new, additive
`POST /auth/email/challenge` contract endpoint (R3, R10); Redis for refresh-token rotation +
revocation + rate limiting, the first real consumer of [ADR-0007](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0007-redis-cache-and-token-rotation.md)
(R4); automatic handle generation with collision retry (R5); `expo-auth-session`'s Google provider
and `expo-secure-store` on mobile, keeping the app in Expo Go with no dev-client build (R6, R7);
and Cucumber wired to execute `authentication.feature` directly, this phase's explicit "first real
contract + BDD tests in CI" exit criterion (R9). One real doc/code drift was found and reconciled
rather than carried forward silently: `Preferences.theme` has a `"system"` default in the
already-merged entity that no spec documents — the OpenAPI contract (`light|dark` only) wins, and
this feature ships the corrective migration (R8).

## Technical Context

**Language/Version**: Java 25 (Spring Boot, existing `backend/` scaffold) for the API; TypeScript
on React Native (Expo SDK 57, React Native 0.86, React 19 — as established by
`002-theme-components-identity`) for the mobile client.

**Primary Dependencies**:
- **Backend, new**: `spring-boot-starter-security`, `spring-boot-starter-oauth2-resource-server`
  (R1), `com.nimbusds:oauth2-oidc-sdk` (R2), `io.jsonwebtoken:jjwt-api`/`jjwt-impl`/`jjwt-jackson`
  (R1), `spring-boot-starter-data-redis` (R4), test-scope `io.cucumber:cucumber-java` /
  `cucumber-spring` / `cucumber-junit-platform-engine` (R9) and a Testcontainers Redis module.
- **Backend, reused**: Spring Modulith's JPA event publication registry as the transactional outbox
  (same pattern as [`NotificationService`](../../backend/src/main/java/com/viego/notification/service/NotificationService.java)),
  the existing `identityFlyway` bean, springdoc-openapi.
- **Mobile, new**: `expo-auth-session` (+ its `expo-web-browser`/`expo-crypto` peers) for Google
  sign-in (R6), `expo-secure-store` for on-device token storage (R7).
- **Mobile, reused**: Zustand (+`persist`/`AsyncStorage`) for `sessionStore`, TanStack Query for
  server state, the existing `SocialAuthButton`/`Input`/`Button` components, the existing
  `shared/api/client.ts` seam (its own comment already anticipates "auth header, refresh, etc.").

**Storage**: PostgreSQL `identity` schema (existing tables `explorers`, `auth_providers`,
`preferences`; this feature adds one corrective migration, `V2__preferences_theme_default.sql` —
see [data-model.md](data-model.md)). **Redis** (new infrastructure dependency for this feature,
namespace `identity:*` per ADR-0007) for refresh-token rotation, access-token revocation, rate
limiting, and the email one-time-code challenge — never a system of record.

**Testing**: JUnit 5 (domain unit), `@DataJpaTest` + Testcontainers Postgres (persistence),
`@WebMvcTest` (controllers/serialization/error model), `@ApplicationModuleTest` (module + events),
Cucumber over `authentication.feature` (BDD, R9), OpenAPI contract tests, `ApplicationModules.verify()`
(boundary). Mobile: Jest + React Native Testing Library for the updated screens/stores; Maestro for
the cross-screen sign-in → land-in-app journey (existing project convention, `mobile/CLAUDE.md`).

**Target Platform**: Backend — existing containerized deploy target (dev environment, per the P0
CI→dev pipeline). Mobile — iOS/Android via **Expo Go** (R6/R7 deliberately avoid any dependency
that would force a dev-client build, continuing `002`'s precedent).

**Project Type**: Mobile + API — `backend/` (Spring Boot REST API) and `mobile/` (Expo React Native
client) within the existing monorepo; no new top-level project.

**Performance Goals**: SC-001 — sign-in-to-signed-in-Explorer completes in under 5s under normal
network conditions. No new throughput target beyond the project's existing
[NFR-PERF](../../docs/01-product-documentation/01-core-specifications/requirements/non-functional-requirements.md)
baseline; auth's hot path (access-token validation) stays Redis-free (self-validating JWT) so it
doesn't add a network hop to every authenticated request.

**Constraints**: [NFR-SEC-01](../../docs/01-product-documentation/01-core-specifications/requirements/non-functional-requirements.md#nfr-sec--security--privacy)
(Bearer JWT on every non-public endpoint), NFR-SEC-02 (`me`-scoping), NFR-SEC-04 (no stored
passwords — the entire reason for R3), NFR-SEC-06 (no PII in logs/URLs — the OTP code and provider
tokens must never be logged), NFR-SEC-07 (rate limiting), NFR-REL-01 (events published in the same
transaction as the state change), NFR-REL-02 (idempotent consumers downstream); `ApplicationModules.verify()`
must stay green; mobile must stay Expo-Go-compatible (no dev-client requirement introduced).

**Scale/Scope**: 4 REST endpoints (`POST /auth/email/challenge` new; `POST /auth/{provider}`,
`POST /auth/refresh`, `GET /explorers/me`, `PUT /explorers/me/preferences` — 5 total, first real
ones this backend exposes beyond `/status`); 2 domain events; 1 new migration; 4 mobile
screens/stores rewired (`login.tsx`, `register.tsx`, `ProfileScreen.tsx`, `sessionStore.ts` fed by
a new `shared/api/auth.ts` + `authTokenStore.ts` in place of `shared/mock/explorerRepository.ts`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify this plan against the VieGo Documentation Constitution (`.specify/memory/constitution.md`):

- [x] **I. Specs are source of truth** — Behaviour originates in the Core Specifications:
      `authentication.feature` (Gherkin) and `rest-api.openapi.yaml`/`domain-events.asyncapi.yaml`.
      One required contract extension (`POST /auth/email/challenge` + optional `email`/`code`
      fields, R10) was made to the **canonical** OpenAPI file *before* this plan's design work,
      not left implicit in code. One doc/code drift found (`Preferences.theme` default, R8) is
      flagged and reconciled in favor of the contract, not silently carried forward.
- [x] **II. Ubiquitous language** — Uses exact DDD terms: **Explorer**, **Auth Provider**,
      **Preferences**, **handle** (matches `ddd-and-domain-model.md`'s glossary exactly — an
      earlier draft of this plan's own spec used "Auth Provider Link," a synonym, and was
      corrected before this check). No new domain term is introduced by this feature.
- [x] **III. Architecture & module boundaries** — `identity` gains its application/web/security
      layers but still depends only on `shared` (`package-info.java` already declares
      `allowedDependencies = {"shared"}` — unchanged by this feature, since identity consumes no
      peer's events). No cross-schema FK, no entity crosses a module boundary (events carry ids
      only). `ApplicationModules.verify()` re-run as part of this feature's own test suite.
- [x] **IV. Documentation conventions** — This feature's doc changes are the OpenAPI contract edit
      (existing file, existing frontmatter-free format — OpenAPI files aren't Markdown pages) and
      this `specs/004-identity-auth-backend/` folder itself, which follows the same structure as
      `001`–`003`. No new `docs/` page is added by this plan; ADR-0007's status change
      (Proposed → Accepted) is a follow-up task against the existing ADR file's frontmatter/status
      line, not a new page.
- [x] **V. Immutable decisions & spec-first flow** — The OpenAPI contract was edited first (this
      Phase 1 work), before any implementation task exists in `tasks.md`. ADR-0007 is referenced,
      not edited-to-change-its-outcome; its promotion to Accepted is additive (a status field), the
      same discipline as `V1` migrations never being edited (R8 ships `V2`, not an edit to `V1`).

No violations. Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/004-identity-auth-backend/
├── plan.md                                    # This file (/speckit-plan command output)
├── research.md                                # Phase 0 output — 11 decisions (R1–R11)
├── data-model.md                               # Phase 1 output — Explorer/AuthProvider/Preferences + ephemeral Redis records
├── quickstart.md                               # Phase 1 output — env vars, curl walkthrough, mobile verification
├── contracts/                                   # Phase 1 output
│   ├── rest-api.identity.openapi.yaml           # Identity-scoped excerpt of the canonical OpenAPI (kept in sync)
│   └── domain-events.identity.asyncapi.yaml     # Identity-scoped excerpt of the canonical AsyncAPI
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
backend/
├── src/main/java/com/viego/
│   ├── identity/
│   │   ├── domain/                 # Explorer, AuthProvider, Preferences (EXISTING — from 003)
│   │   ├── application/            # NEW — RegisterOrSignInService, UpdatePreferencesService,
│   │   │                           #        RefreshTokenService, EmailChallengeService
│   │   ├── infrastructure/
│   │   │   ├── web/                # NEW — AuthController, ExplorerController
│   │   │   ├── security/           # NEW — JwtService (issue/validate), SecurityConfig,
│   │   │   │                       #        GoogleIdTokenVerifier adapter
│   │   │   └── redis/              # NEW — RefreshTokenRotationStore, RevocationStore,
│   │   │                           #        RateLimiter, EmailChallengeStore
│   │   ├── api/                    # EXISTING (empty) — ExplorerRegistered, PreferencesUpdated (NEW records)
│   │   └── package-info.java       # EXISTING — allowedDependencies unchanged ({"shared"})
│   └── shared/
│       └── config/                 # RedisConfig (NEW) alongside existing DatabaseConfig/FlywayConfig
└── src/main/resources/
    └── db/migration/identity/
        ├── V1__init_identity_schema.sql        # EXISTING — not edited
        └── V2__preferences_theme_default.sql   # NEW (R8)

mobile/
└── app/
    ├── (auth)/
    │   ├── login.tsx           # MODIFIED — password field removed; email code step; live Google button
    │   └── register.tsx        # MODIFIED — same email/code flow; display name only (no password)
    ├── screens/
    │   └── ProfileScreen.tsx   # MODIFIED — theme/language switches call the real preferences API
    └── shared/
        ├── api/
        │   ├── client.ts              # MODIFIED — Bearer interceptor + 401 refresh (per its own seam comment)
        │   ├── auth.ts                # NEW — challenge/signIn/refresh/getMe/updatePreferences calls
        │   └── authTokenStore.ts      # NEW — expo-secure-store wrapper (R7)
        ├── store/
        │   └── sessionStore.ts        # UNCHANGED shape — now driven by real API responses (R7)
        └── mock/
            └── explorerRepository.ts  # REMOVED — no mock/local fallback remains (FR-017)
```

**Structure Decision**: Existing monorepo layout, unchanged. Backend: the `identity` module gains
its `application`/`infrastructure` layers (previously an empty Phase 0 skeleton) following the
same layering already visible in `notification` (`service`/`persistence`/`listener`) and the
Module Boundary Rules (ports in `domain`, adapters in `infrastructure`). Mobile: no new top-level
folder — this feature works entirely inside the existing `mobile/app/(auth)/` +
`mobile/app/shared/` structure `002` established (the aspirational `src/features/identity/` layout
in `frontend-architecture.md` is not adopted here, to avoid an unscoped restructuring alongside a
feature change — noted as an existing, pre-existing doc/code gap, not one this feature widens).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
