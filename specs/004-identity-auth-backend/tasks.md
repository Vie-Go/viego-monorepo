# Tasks: Identity — Live Authentication & Preferences

**Input**: Design documents from `/specs/004-identity-auth-backend/`
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

**Tests**: Included. This repo's [test-strategy.md](../../docs/02-process-documentation/test-strategy.md)
and this phase's own exit criteria ("first real contract + BDD tests in CI") make backend
unit/module/web-slice/BDD coverage and mobile Jest/RNTL coverage part of this feature's definition
of done, not an optional extra — same convention `002-theme-components-identity` followed (tests
land in the same change as the screen/service they cover, verified failing/absent then passing,
per [mobile/CLAUDE.md](../../mobile/CLAUDE.md)).

**Organization**: Tasks are grouped by user story (US1–US4, priorities from [spec.md](spec.md)) so
each is independently implementable and testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Which user story this task belongs to (US1–US4)
- File paths are exact, per [plan.md](plan.md)'s Project Structure section

## Path Conventions

Mobile + API layout (per [plan.md](plan.md)): `backend/src/main/java/com/viego/...` (Spring
Modulith), `backend/src/test/java/com/viego/...`, `mobile/app/...`, `mobile/__tests__/...`.

**Mobile server-state convention** (confirmed against live code, not just docs — see
[research.md](research.md) and `mobile/CLAUDE.md`): all backend reads/writes go through
**TanStack Query** (`useQuery`/`useMutation`), the same pattern
[`ConnectivityCard.tsx`](../../mobile/app/screens/ConnectivityCard.tsx) already establishes
(`useQuery({ queryKey: [...], queryFn: <plain function from shared/api/*.ts> } )`). Token refresh
(`POST /auth/refresh`) is the one exception — it lives in the `shared/api/client.ts` fetch
interceptor, not a hook, since it must run transparently outside any component's lifecycle.
`shared/api/*.ts` files stay plain, typed functions; hooks live in the screens that call them.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the dependencies this feature needs; nothing here is business logic yet.

- [X] T001 Add backend dependencies to `backend/pom.xml`: `spring-boot-starter-security`,
      `spring-boot-starter-oauth2-resource-server`, `com.nimbusds:oauth2-oidc-sdk`,
      `io.jsonwebtoken:jjwt-api`/`jjwt-impl`/`jjwt-jackson` (main scope); `io.cucumber:cucumber-java`,
      `io.cucumber:cucumber-spring`, `io.cucumber:cucumber-junit-platform-engine`, and the
      Testcontainers Redis module (test scope) — see [research.md R1, R2, R4, R9](research.md)
- [X] T002 [P] Add `spring-boot-starter-data-redis` (Lettuce) to `backend/pom.xml` — [research.md R4](research.md#r4--refresh-token-rotation-revocation-and-rate-limiting-redis)
- [X] T003 [P] Install mobile dependencies: `npx expo install expo-auth-session expo-web-browser expo-crypto expo-secure-store` (updates `mobile/package.json`) — [research.md R6, R7](research.md)
- [X] T004 [P] Add new environment variables with dev-safe defaults to `backend/src/main/resources/application.yml`: `REDIS_URL`, `JWT_SIGNING_SECRET`, `GOOGLE_OAUTH_CLIENT_ID`, `EMAIL_CHALLENGE_SENDER` — see [quickstart.md §1](quickstart.md#1-environment-variables-new-for-this-feature)

**Checkpoint**: Dependencies resolve (`./mvnw compile`, `npx expo install` clean); no behavior yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infrastructure every user story needs — security, token signing, Redis connectivity,
the one corrective migration, and (newly identified) the mobile React Query provider. No user
story can be implemented before this phase completes.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 [P] Configure the Redis connection (`RedisConnectionFactory`/Lettuce) in `backend/src/main/java/com/viego/shared/config/RedisConfig.java`, alongside the existing `DatabaseConfig`/`FlywayConfig` — [research.md R4](research.md#r4--refresh-token-rotation-revocation-and-rate-limiting-redis)
- [X] T006 [P] Add migration `backend/src/main/resources/db/migration/identity/V2__preferences_theme_default.sql`: alter `identity.preferences.theme`'s column default from `'system'` to `'light'` — [research.md R8](research.md#r8--theme-preference-values-reconciling-a-real-doccode-drift), [data-model.md](data-model.md#preferences-existing-table-identitypreferences)
- [X] T007 [P] Fix the default in `backend/src/main/java/com/viego/identity/domain/Preferences.java`'s `@Builder.Default` for `theme` from `"system"` to `"light"`, matching T006
- [X] T008 [P] Implement `JwtService` (issue + validate self-issued HS256 access/refresh JWTs; claims `sub`, `jti`, `iat`, `exp`) in `backend/src/main/java/com/viego/identity/infrastructure/security/JwtService.java` — [research.md R1](research.md#r1--session-token-issuance--verification)
- [X] T009 [P] Implement `SecurityConfig` (`SecurityFilterChain`: `permitAll` on `/api/v1/status`, `/api/v1/auth/**`; Bearer-JWT-required elsewhere via `oauth2ResourceServer().jwt()` backed by T008's signing key) in `backend/src/main/java/com/viego/identity/infrastructure/security/SecurityConfig.java` — NFR-SEC-01
- [X] T010 [P] Create `authTokenStore.ts` (thin `expo-secure-store` wrapper: `getAccessToken`/`getRefreshToken`/`setTokens`/`clearTokens`) in `mobile/app/shared/api/authTokenStore.ts` — [research.md R7](research.md#r7--where-session-tokens-live-on-device)
- [X] T011 [P] Add a `QueryClientProvider` (`new QueryClient()`, wrapped around the existing `GestureHandlerRootView`/`SafeAreaProvider`/`ThemeProvider`/`I18nProvider` tree) in `mobile/app/_layout.tsx` — **newly identified gap**: no `QueryClientProvider` exists anywhere in the app today. `ConnectivityCard.tsx` already calls `useQuery` but is unmounted dead code, so this has never been exercised at runtime; every US4 task below needs it to exist first.
- [X] T012 Extend `mobile/app/shared/api/client.ts` with a Bearer-auth request interceptor (reads from T010) and a 401 → refresh-and-retry path (depends on T010)

**Checkpoint**: Foundation ready — `./mvnw test -Dtest=ApplicationModulesTest` still green; a
`useQuery` hook mounted anywhere in the app no longer throws; user story implementation can now
begin.

---

## Phase 3: User Story 1 - A visitor signs in and becomes an Explorer (Priority: P1) 🎯 MVP

**Goal**: Sign in with Email (passwordless code) or Google (verified ID token) → become a durable
Explorer with a unique handle, exactly once per identity.

**Independent Test**: [spec.md's US1 Independent Test](spec.md#user-story-1---a-visitor-signs-in-and-becomes-an-explorer-priority-p1) — complete sign-in with Google and separately with Email from a
clean account; confirm one Explorer row per identity even under retried requests.

### Implementation for User Story 1

- [X] T013 [P] [US1] Add `ExplorerRegistered` record (`explorerId`, `handle`, `at`) in `backend/src/main/java/com/viego/identity/api/ExplorerRegistered.java` — [data-model.md](data-model.md#registrationpreference-record-event--not-a-table)
- [X] T014 [P] [US1] Implement Google ID token verification (`com.nimbusds:oauth2-oidc-sdk` against Google's JWKS; checks `iss`/`aud`/`exp`/signature) in `backend/src/main/java/com/viego/identity/infrastructure/security/GoogleIdTokenVerifier.java` — [research.md R2](research.md#r2--verifying-the-google-id-token)
- [X] T015 [P] [US1] Implement `EmailChallengeStore` (Redis `identity:otp:{email}`: generate/store/verify a 6-digit code, capped attempts, short TTL) in `backend/src/main/java/com/viego/identity/infrastructure/redis/EmailChallengeStore.java` — [research.md R3](research.md#r3--email-sign-in-without-a-password)
- [X] T016 [P] [US1] Define the `EmailChallengeSender` port in `backend/src/main/java/com/viego/identity/application/EmailChallengeSender.java` and a `console`-logging implementation in `backend/src/main/java/com/viego/identity/infrastructure/ConsoleEmailChallengeSender.java` (selected by `EMAIL_CHALLENGE_SENDER=console`)
- [X] T017 [P] [US1] Implement `HandleGenerator` (derive from display name/email local-part, sanitize, truncate to 32 chars, collision-retry with numeric suffix) in `backend/src/main/java/com/viego/identity/application/HandleGenerator.java` — [research.md R5](research.md#r5--handle-generation)
- [X] T018 [US1] Implement `RegisterOrSignInService` (find-or-create `Explorer` + `AuthProvider` **and its owning `Preferences` row with `vi`/`light` defaults** in one transaction using T013/T014/T017; create-once semantics; publish `ExplorerRegistered` via `ApplicationEventPublisher` only on create, matching [`NotificationService.raise`](../../backend/src/main/java/com/viego/notification/service/NotificationService.java)'s pattern) in `backend/src/main/java/com/viego/identity/application/RegisterOrSignInService.java` (depends on T013, T014, T017) — FR-010, [data-model.md](data-model.md#preferences-existing-table-identitypreferences)
- [X] T019 [US1] Implement `EmailChallengeService` (issue a code via T015/T016; verify a submitted code, feeding a verified email into T018 as the `email` provider identity) in `backend/src/main/java/com/viego/identity/application/EmailChallengeService.java` (depends on T015, T016)
- [X] T020 [US1] Implement `AuthController`: `POST /auth/email/challenge` (T019), `POST /auth/{provider}` (`email` → T019+T018; `google` → T014+T018; `facebook`/`zalo` → `501`) in `backend/src/main/java/com/viego/identity/infrastructure/web/AuthController.java` (depends on T018, T019) — [contracts/rest-api.identity.openapi.yaml](contracts/rest-api.identity.openapi.yaml)
- [X] T021 [US1] Implement a Redis fixed-window rate limiter for `/api/v1/auth/*` (`identity:ratelimit:{ip}:{route}`, `INCR`+`EXPIRE`) wired as a `HandlerInterceptor`/filter ahead of `AuthController`, in `backend/src/main/java/com/viego/identity/infrastructure/security/AuthRateLimiter.java` — NFR-SEC-07
- [X] T022 [P] [US1] Unit test `HandleGenerator`'s collision-retry in `backend/src/test/java/com/viego/identity/HandleGeneratorTest.java`
- [X] T023 [P] [US1] `@DataJpaTest`/`@ApplicationModuleTest` for `RegisterOrSignInService`: exactly-once creation under a simulated retry/duplicate call, default `Preferences` row present immediately (FR-010), `ExplorerRegistered` published only on create, in `backend/src/test/java/com/viego/identity/RegisterOrSignInServiceTest.java`
- [X] T024 [P] [US1] `@WebMvcTest` for `AuthController`: invalid/expired/tampered credential → `400`, no session issued; unsupported provider → `501`, in `backend/src/test/java/com/viego/identity/AuthControllerTest.java`
- [X] T025 [US1] Cucumber step definitions for `authentication.feature`'s `Scenario Outline` (Email/Google/Facebook rows — Facebook asserts `501`) against a `@SpringBootTest` + Testcontainers (Postgres, Redis) context, in `backend/src/test/java/com/viego/identity/cucumber/AuthenticationSteps.java` + a JUnit-platform Cucumber runner in `backend/src/test/java/com/viego/identity/cucumber/RunCucumberTest.java`, **tag-filtered to exclude `@draft`** (the "Account linking" scenario has no step definitions — it's explicitly out of scope per FR-019 — so it must never execute, only `@ready` + untagged scenarios do) — [research.md R9](research.md#r9--making-authenticationfeature-executable-bdd)
- [X] T026 [US1] Contract test asserting `AuthController`'s `200` response body matches `contracts/rest-api.identity.openapi.yaml`'s `Session` schema, in `backend/src/test/java/com/viego/identity/AuthContractTest.java`

**Checkpoint**: US1 independently testable via [quickstart.md §2](quickstart.md#2-sign-in-end-to-end-email-passwordless) (curl-only, no other story needed).

---

## Phase 4: User Story 2 - Preferences follow the Explorer, not the device (Priority: P1)

**Goal**: A signed-in Explorer's language/theme are saved to their account and read back
identically on any later session/device.

**Independent Test**: [spec.md's US2 Independent Test](spec.md#user-story-2---preferences-follow-the-explorer-not-the-device-priority-p1) — set language/theme, sign out, sign back in on a fresh
session, confirm both values are unchanged.

### Implementation for User Story 2

- [X] T027 [P] [US2] Add `PreferencesUpdated` record (`explorerId`, `language`, `theme`, `at`) in `backend/src/main/java/com/viego/identity/api/PreferencesUpdated.java`
- [X] T028 [US2] Implement `UpdatePreferencesService` (replace `Preferences` wholesale in a transaction; publish `PreferencesUpdated`) in `backend/src/main/java/com/viego/identity/application/UpdatePreferencesService.java` (depends on T027)
- [X] T029 [US2] Implement `ExplorerController`: `GET /explorers/me` (`me`-scoped from the JWT `sub`, never a path/query id), `PUT /explorers/me/preferences` (T028) in `backend/src/main/java/com/viego/identity/infrastructure/web/ExplorerController.java` (depends on T028) — NFR-SEC-02
- [X] T030 [P] [US2] `@DataJpaTest` for `UpdatePreferencesService`: persists + publishes exactly once per call, in `backend/src/test/java/com/viego/identity/UpdatePreferencesServiceTest.java`
- [X] T031 [P] [US2] `@WebMvcTest` for `ExplorerController`: preferences round-trip, and a request for another Explorer's data is refused, in `backend/src/test/java/com/viego/identity/ExplorerControllerTest.java`
- [X] T032 [US2] Extend `AuthenticationSteps.java` (T025) with step definitions for the `@ready` "Preferences persist across sessions" scenario, so it gates CI per its own tag

**Checkpoint**: US1 + US2 independently testable via [quickstart.md §3](quickstart.md#3-preferences-round-trip-the-ready-gate-scenario) — this is the phase's own `@ready` gate.

---

## Phase 5: User Story 3 - An Explorer stays signed in through normal use (Priority: P2)

**Goal**: Sessions renew silently during normal use; a replayed refresh token is rejected and its
whole rotation family is shut down.

**Independent Test**: [spec.md's US3 Independent Test](spec.md#user-story-3---an-explorer-stays-signed-in-through-normal-use-priority-p2) — rotate a refresh token once (succeeds), replay the
same (now-superseded) token (rejected, family revoked).

### Implementation for User Story 3

- [X] T033 [P] [US3] Implement `RefreshTokenRotationStore` (`identity:refresh:{familyId}`: current handle + explorerId + lineage; reuse detection on mismatch) in `backend/src/main/java/com/viego/identity/infrastructure/redis/RefreshTokenRotationStore.java` — [research.md R4](research.md#r4--refresh-token-rotation-revocation-and-rate-limiting-redis)
- [X] T034 [P] [US3] Implement `RevocationStore` (`identity:revoked:{jti}` denylist, TTL-bounded by access-token lifetime) in `backend/src/main/java/com/viego/identity/infrastructure/redis/RevocationStore.java`
- [X] T035 [US3] Implement `RefreshTokenService` (rotate: validate + issue new pair via T008; on reuse, revoke the whole family via T033/T034) in `backend/src/main/java/com/viego/identity/application/RefreshTokenService.java` (depends on T008, T033, T034)
- [X] T036 [US3] Wire `POST /auth/refresh` in `AuthController` (T020) to T035: `200` + new `Session` on success, `401` on reuse/invalid (depends on T020, T035)
- [X] T037 [P] [US3] Integration test (Testcontainers Redis) for `RefreshTokenService`: successful rotation, then reuse of the superseded token revokes the family (the *new* token also stops working), in `backend/src/test/java/com/viego/identity/RefreshTokenServiceTest.java`
- [X] T038 [P] [US3] `@WebMvcTest` for `/auth/refresh`'s `401`-on-replay behavior in `backend/src/test/java/com/viego/identity/AuthRefreshControllerTest.java`

**Checkpoint**: US1 + US2 + US3 independently testable via [quickstart.md §4](quickstart.md#4-refresh-rotation--reuse-detection-fr-013).

---

## Phase 6: User Story 4 - The app runs on real accounts, not mock data (Priority: P2)

**Goal**: `002`'s sign-in/register/preferences screens work identically from the Explorer's point
of view, but against the real backend (Phases 3–5) with zero mock/local fallback.

**Independent Test**: [spec.md's US4 Independent Test](spec.md#user-story-4---the-app-runs-on-real-accounts-not-mock-data-priority-p2) — repeat `002`'s sign-in/register/preferences acceptance
scenarios against the live backend; confirm survival across an app reinstall.

### Implementation for User Story 4

- [X] T039 [P] [US4] Implement `shared/api/auth.ts` (`requestEmailChallenge`, `signIn`, `refresh`, `getMe`, `updatePreferences` — plain typed functions per `contracts/rest-api.identity.openapi.yaml`, consumed as `queryFn`/`mutationFn` the same way `client.ts`'s `getStatus` already backs `ConnectivityCard`'s `useQuery`) in `mobile/app/shared/api/auth.ts`
- [X] T040 [US4] Rewire `mobile/app/(auth)/login.tsx`: remove the password field; add an email-then-code step driven by a `useMutation` calling `requestEmailChallenge`/`signIn` (T039) — on success, seed the `['identity','me']` React Query cache with the returned `explorer` via `queryClient.setQueryData` and call `sessionStore.signIn()`; wire the Google `SocialAuthButton` to `expo-auth-session`'s Google provider feeding the same sign-in mutation; surface the FR-018 connectivity error from the mutation's `onError` (depends on T011, T039)
- [X] T041 [US4] Rewire `mobile/app/(auth)/register.tsx`: the same passwordless email/code flow as T040, as its own `useMutation`; display-name-only (no password field); surface the FR-018 connectivity error from `onError`, matching T040 (depends on T011, T039)
- [X] T042 [US4] Wire `mobile/app/screens/ProfileScreen.tsx` to real preferences: read the current Explorer/preferences via `useQuery({ queryKey: ['identity','me'], queryFn: getMe })` (T039) instead of only the local `useTheme`/`useI18n` stores, and change theme/language via a `useMutation` calling `updatePreferences` (T039) that optimistically updates that same `['identity','me']` cache entry, per the identity module design's documented pattern (depends on T011, T039)
- [X] T043 [US4] Update `mobile/app/shared/store/sessionStore.ts`'s `signIn` call sites to persist tokens via `authTokenStore` (T010) — the store's own shape (`explorerId`, `status`, `onboardingCompletedAt`) is unchanged, per its existing code comment
- [X] T044 [US4] Delete `mobile/app/shared/mock/explorerRepository.ts` and remove all imports of it (grep confirms zero references remain) — FR-017
- [X] T045 [P] [US4] Update `mobile/__tests__/screens/login.test.tsx` for the email/code flow and the connectivity-error case (replacing the removed password-field assertions)
- [X] T046 [P] [US4] Update `mobile/__tests__/screens/register.test.tsx` for the same passwordless flow
- [X] T047 [P] [US4] Unit test `authTokenStore.ts` in `mobile/__tests__/api/authTokenStore.test.ts`
- [X] T048 [P] [US4] Unit test `shared/api/auth.ts` (mocked `fetch`, one test per call) in `mobile/__tests__/api/auth.test.ts`
- [X] T049 [P] [US4] Unit test `ProfileScreen.tsx`'s query/mutation wiring (React Query test utilities — a wrapped `QueryClientProvider` in the test harness) in `mobile/__tests__/screens/ProfileScreen.test.tsx`
- [X] T050 [US4] Remove `mobile/__tests__/mock/explorerRepository.test.ts` (its subject no longer exists per T044)
- [X] T051 [US4] Maestro E2E flow (sign in with email code → land in app → change a preference → simulate reinstall → sign in again → same account/handle/preferences) in `mobile/.maestro/identity-live-auth.yaml`

**Checkpoint**: All four user stories independently functional; [quickstart.md §5](quickstart.md#5-mobile-leaving-mock-data-behind) passes end-to-end.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T052 [P] Confirm `./mvnw test -Dtest=ApplicationModulesTest` (module boundaries) and `ModulithVerificationTest` stay green with the new `identity` internals
- [X] T053 [P] NFR-SEC-06 audit: grep backend logging/exception output to confirm the OTP code, provider tokens, and JWTs are never logged in plaintext
- [X] T054 [P] Promote [ADR-0007](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0007-redis-cache-and-token-rotation.md)'s status line from *Proposed* to *Accepted* (this feature is its first real consumer) — status/date fields only, not the decision content
- [ ] T055 Run [quickstart.md](quickstart.md) end-to-end by hand: the full curl walkthrough (§2–4), timing the sign-in call against SC-001's 5s target, and the mobile Expo Go smoke test (§5) on both iOS and Android
- [ ] T056 [P] Both-theme/both-locale sweep of the four touched mobile screens (login, register, onboarding hand-off, profile) per [test-strategy.md](../../docs/02-process-documentation/test-strategy.md)'s cross-cutting rule

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — **blocks all user stories**.
- **User Story 1 (Phase 3)**: Depends on Foundational only. This is the MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational; in practice needs a signed-in Explorer to
  test against, so build after US1 even though it has no *code* dependency on US1's files.
- **User Story 3 (Phase 5)**: Depends on Foundational (T008's `JwtService`) and extends US1's
  `AuthController` (T020) — build after US1.
- **User Story 4 (Phase 6)**: Depends on US1 + US2 + US3 existing server-side (the mobile screens
  call all three's endpoints) and on T011's `QueryClientProvider` — build last.
- **Polish (Phase 7)**: Depends on all four stories.

### Parallel Opportunities

- Setup: T002–T004 in parallel once T001 lands (T001 itself must land first — same `pom.xml`).
- Foundational: T005–T011 are all different files — parallelizable; T012 (client.ts interceptor)
  depends on T010.
- US1: T013–T017 are five independent files — parallelizable; T018 needs T013/T014/T017; T019
  needs T015/T016; T020 needs T018/T019; T022–T024 parallelizable once their subject exists; T025
  after T020 (needs the controller to drive); T026 after T020.
- US2: T027 parallelizable with anything from US1; T028 needs T027; T029 needs T028; T030/T031
  parallelizable once T028/T029 exist.
- US3: T033/T034 parallelizable; T035 needs both; T036 needs T035 and T020 (US1); T037/T038
  parallelizable once T035/T036 exist.
- US4: T039 first (needs T011 to be usable, but can be *written* in parallel with it — only
  *running* it needs T011 in place); T040–T042 depend on T039 (and T011) but touch different files
  (parallelizable with each other); T043 independent of T040–T042; T044 last (only after nothing
  references the mock anymore); T045–T049 parallelizable once their subject file is updated; T050
  after T044; T051 last (exercises the whole rewired flow).

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch independent foundational pieces together:
Task: "Configure Redis connection in backend/src/main/java/com/viego/shared/config/RedisConfig.java"
Task: "Add V2 migration in backend/src/main/resources/db/migration/identity/V2__preferences_theme_default.sql"
Task: "Fix Preferences.java theme default in backend/src/main/java/com/viego/identity/domain/Preferences.java"
Task: "Implement JwtService in backend/src/main/java/com/viego/identity/infrastructure/security/JwtService.java"
Task: "Implement SecurityConfig in backend/src/main/java/com/viego/identity/infrastructure/security/SecurityConfig.java"
Task: "Create authTokenStore.ts in mobile/app/shared/api/authTokenStore.ts"
Task: "Add QueryClientProvider in mobile/app/_layout.tsx"
```

## Parallel Example: Phase 3 (User Story 1)

```bash
Task: "Add ExplorerRegistered record in backend/src/main/java/com/viego/identity/api/ExplorerRegistered.java"
Task: "Implement GoogleIdTokenVerifier in backend/src/main/java/com/viego/identity/infrastructure/security/GoogleIdTokenVerifier.java"
Task: "Implement EmailChallengeStore in backend/src/main/java/com/viego/identity/infrastructure/redis/EmailChallengeStore.java"
Task: "Implement EmailChallengeSender port + console sender"
Task: "Implement HandleGenerator in backend/src/main/java/com/viego/identity/application/HandleGenerator.java"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (blocks everything)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: run [quickstart.md §2](quickstart.md#2-sign-in-end-to-end-email-passwordless) by hand
5. This alone proves sign-in, unique-handle assignment, and exactly-once registration — the gate
   for every later phase per the [critical path](../../docs/02-process-documentation/plans-estimates-schedules.md#critical-path--dependencies)

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. + US1 → sign-in works → validate independently (MVP)
3. + US2 → preferences persist → validate independently (this phase's `@ready` gate)
4. + US3 → sessions stay alive safely → validate independently
5. + US4 → the mobile app actually uses all of the above, mock data gone → validate independently
   → this is the phase's real exit criterion (v0.2 ships)

### Notes

- `[P]` tasks touch different files with no unfinished dependency between them.
- Verify each test is failing (or the behavior is visibly absent) before implementing, then
  passing after — same discipline `002-theme-components-identity` followed.
- Commit after each task or logical group; stop at any checkpoint to validate a story on its own.
- Avoid: implementing US4's mobile screens against endpoints US1–US3 haven't built yet (they will
  silently keep hitting the mock repository or fail); editing `V1__init_identity_schema.sql`
  instead of adding `V2` (T006); logging OTP codes or tokens anywhere `EMAIL_CHALLENGE_SENDER`
  isn't explicitly `console` (T053 exists specifically to catch this); calling `useQuery`/
  `useMutation` anywhere before T011's `QueryClientProvider` lands (it will throw at runtime, the
  same way `ConnectivityCard.tsx` would today if anything mounted it).
