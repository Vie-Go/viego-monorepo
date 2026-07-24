# Handoff: Phase 1–3 (Setup, Foundational, US1 — Sign in & become an Explorer)

**Status**: T001–T026 complete and marked `[X]` in [tasks.md](tasks.md). This is the MVP checkpoint.

## What's built

**Setup/Foundational (T001–T012)**
- `backend/pom.xml`: `spring-boot-starter-security`, `spring-boot-starter-oauth2-resource-server`,
  `spring-boot-starter-data-redis`, `com.nimbusds:oauth2-oidc-sdk`, `io.jsonwebtoken:jjwt-*`,
  Cucumber (`cucumber-java`/`cucumber-spring`/`cucumber-junit-platform-engine`), Testcontainers
  (`junit-jupiter`, `postgresql`, `com.redis:testcontainers-redis`), `spring-boot-resttestclient`,
  `spring-security-test`.
- `application.yml`: `REDIS_URL`, `JWT_SIGNING_SECRET` (dev default, HS256, auto-padded to 256 bits
  if shorter), `GOOGLE_OAUTH_CLIENT_ID`, `EMAIL_CHALLENGE_SENDER` (default `console`), plus
  `access-token-ttl` (15m) / `refresh-token-ttl` (30d).
- `RedisConfig` — `StringRedisTemplate` bean; `RedisConnectionFactory` itself is Boot's own
  auto-configuration (driven by `spring.data.redis.url`), not hand-rolled.
- `V2__preferences_theme_default.sql` + `Preferences.java`'s `@Builder.Default` — theme default
  `system` → `light` (research R8).
- `JwtService` — issues/validates self-issued HS256 access+refresh JWTs.
- `SecurityConfig` — `permitAll` on `/api/v1/status`, `/api/v1/auth/**`, springdoc paths;
  everything else needs a Bearer JWT via `oauth2ResourceServer().jwt()`.
- Mobile: `authTokenStore.ts` (expo-secure-store wrapper), `QueryClientProvider` in `_layout.tsx`,
  `client.ts` rewritten with a Bearer interceptor + transparent 401→refresh→retry (single in-flight
  refresh shared across concurrent 401s). `getStatus()`'s public signature is unchanged.

**US1 (T013–T026)** — full sign-in path:
- `ExplorerRegistered` event record.
- `GoogleIdTokenVerifier` — Nimbus OIDC SDK, validates against Google's live JWKS
  (`iss`/`aud`/`exp`/signature).
- `EmailChallengeStore` (Redis hash, 6-digit code, 10 min TTL, 5-attempt cap, one-time use) +
  `EmailChallengeSender` port + `ConsoleEmailChallengeSender` (logs the code — dev-only, gated on
  `EMAIL_CHALLENGE_SENDER=console`).
- `HandleGenerator` — sanitize/truncate/collision-retry against `ExplorerRepository`.
- `RegisterOrSignInService` — find-or-create by `(providerKind, providerSubjectId)`; creates
  Explorer + AuthProvider + Preferences (via `Preferences.builder()`, **not** `new Preferences(id)`
  — see Gotcha below) in one `@Transactional` method; publishes `ExplorerRegistered` only on
  create.
- `EmailChallengeService` — orchestrates issue/verify, normalizes email.
- `AuthController` — `POST /auth/email/challenge` (202), `POST /auth/{provider}` (email/google →
  200 Session; facebook/zalo → 501); Problem Details via Spring's built-in `ProblemDetail`.
- `AuthRateLimiter` — fixed-window Redis limiter on `/api/v1/auth/**`, registered as its own
  `WebMvcConfigurer` (see Gotcha below).
- Tests: `HandleGeneratorTest` (unit, passes), `AuthControllerTest`/`AuthContractTest`
  (`@WebMvcTest`, passes), `RegisterOrSignInServiceTest` (`@DataJpaTest` + Testcontainers Postgres —
  **not run in this sandbox**, see Verification below), Cucumber `AuthenticationSteps`/
  `RunCucumberTest` (Testcontainers Postgres+Redis — **not run in this sandbox**). The Cucumber
  step file also already implements the `@ready` "Preferences persist across sessions" scenario
  (nominally T032/US2) since it needed `PUT /explorers/me/preferences`, built next in Phase 4.

## Verification performed

No Docker in this environment, so nothing Testcontainers-based could execute here. What *did* run
and pass:
- `./mvnw compile` / `test-compile` — clean.
- `HandleGeneratorTest`, `AuthControllerTest`, `AuthContractTest`, `ApplicationModulesTest`,
  `ModulithVerificationTest`, `StatusControllerTest` — all green.
- Full mobile `npm test` — 17 suites / 63 tests green (client.ts rewrite + `_layout.tsx`
  QueryClientProvider didn't break anything existing).
- Confirmed pre-existing `SchemaIsolationTest`/`StandaloneSchemaMigrationTest`/
  `BeatCapturedEventPropagationTest` failures are **not a regression** — this sandbox has no
  Postgres on `localhost:5432` at all (`@SpringBootTest` can't start), independent of this feature.

**Before merging**, run in a Docker-capable environment:
```bash
cd backend
./mvnw test -Dtest=RegisterOrSignInServiceTest
./mvnw test -Dtest=RunCucumberTest
```

## Gotchas discovered (worth knowing for later phases)

1. **`Preferences`'s hand-written `Preferences(UUID)` constructor bypasses `@Builder.Default`.**
   Lombok moves `@Builder.Default` field initializers into the generated builder only — calling
   `new Preferences(id)` directly leaves `language`/`theme`/`updatedAt` **null**, not `vi`/`light`.
   Discovered via a failing `AuthContractTest` assertion. Fixed by using
   `Preferences.builder().explorerId(id).build()` in `RegisterOrSignInService`. Left the
   constructor itself unchanged (pre-existing from `003`, out of this feature's declared scope) —
   **any future code that calls `new Preferences(id)` directly will silently get null prefs.**
2. **`@WebMvcTest` picks up *every* `WebMvcConfigurer`/`HandlerInterceptor` bean in the app,
   regardless of which controller the slice targets.** This broke the pre-existing
   `StatusControllerTest` once `AuthRateLimiter` (a `WebMvcConfigurer`) existed, because it
   required a `StringRedisTemplate` no `@WebMvcTest` slice provides. Fixed by injecting
   `ObjectProvider<StringRedisTemplate>` and no-op'ing (allow the request through) when Redis
   isn't in the context, instead of failing bean creation. Any *other* new global
   `WebMvcConfigurer`/`Filter`/`HandlerInterceptor` added later needs the same treatment or it will
   break unrelated `@WebMvcTest`s app-wide.
3. **Spring Boot 4 package churn vs. what training data assumes**: `@MockBean` is gone (use
   `@MockitoBean` from `org.springframework.test.context.bean.override.mockito`); `RedisProperties`
   → `org.springframework.boot.data.redis.autoconfigure.DataRedisProperties`; `@DataJpaTest` →
   `org.springframework.boot.data.jpa.test.autoconfigure`; `@AutoConfigureTestDatabase` →
   `org.springframework.boot.jdbc.test.autoconfigure`; `TestRestTemplate` moved to its own
   `spring-boot-resttestclient` artifact (`org.springframework.boot.resttestclient`), not bundled
   with `spring-boot-starter-webmvc-test`. Worth double-checking any new Boot-4-era annotation import
   the same way before assuming it compiles.
4. **`authentication.feature` is pulled onto the test classpath via a `pom.xml` `testResource`**
   pointing at its canonical `docs/...` location (`targetPath: features`) — not copied by hand.
   Confirmed working (`target/test-classes/features/identity/authentication.feature` exists after
   `process-test-resources`).
5. **Refresh tokens issued in `AuthController.toSession()` right now are plain self-issued JWTs**,
   with no Redis rotation-family registered yet — that's intentional; Phase 5 (US3) will introduce
   `RefreshTokenService` and is expected to adjust `AuthController`'s sign-in path to seed a
   rotation family at issuance time, not just wire the separate `/auth/refresh` endpoint. Flagged
   here so that change doesn't look like scope creep when it lands.

## What's left before this feature is fully done

Phases 4–7 (US2 preferences, US3 refresh rotation, US4 mobile rewiring, polish) — see
[tasks.md](tasks.md). Proceeding directly to Phase 4 next.
