I'll start by loading the review config and detecting changed files.

No project config exists, so I'll check the extension's default agent toggles.

All agents are enabled by default (no project override exists). Launching the five review agents in parallel — code, comments, tests, errors, and types — against the branch diff; simplify runs afterward if the others come back clean.

All five review agents (code, tests, errors, types, comments) are running in the background against the diff between `004-identity-auth-backend` and `main`, covering the new identity backend module (application/infrastructure layers, Redis config, Preferences domain, event types) and the mobile auth flow (login/register, token store, Google Sign-In, client config). I'll aggregate results and run the simplify pass once these come back — I'll let you know when the summary is ready.

Type design review is in — noted, and I'll keep waiting on the other four before synthesizing.

No action needed — I'll just wait for the remaining background agents to notify me automatically as they complete.

Error handling review is in — several critical findings on token persistence and refresh-failure handling. Waiting on code, tests, and comments reviews to finish before I synthesize the full report.

Comments review is clean — no critical issues. Still waiting on the code quality and test coverage reviews.

Code quality review is in with one critical finding — refresh tokens can authenticate as access tokens. Only the test coverage review remains.

All five review agents have completed. Here's the aggregated report.

# PR Review Summary — `004-identity-auth-backend`

**Scope:** identity/auth backend module (Java/Spring Boot: registration, email-OTP + Google sign-in, Redis-backed refresh-token rotation, preferences) + mobile auth flow (Expo/React Native: login, register, token store, profile). Reviewed via `code`, `tests`, `errors`, `types`, `comments` agents (all enabled by default — no project override exists).

## Critical Issues (8 found)

- **Refresh tokens work as access tokens.** Access and refresh JWTs are structurally identical (no `typ`/scope claim); the resource-server decoder validates signature+expiry only. A leaked refresh token authenticates `GET /explorers/me` etc. for 30 days instead of the intended 15-minute access window. [JwtService.java:57-78](backend/src/main/java/com/viego/identity/infrastructure/security/JwtService.java:57), [SecurityConfig.java:28-31](backend/src/main/java/com/viego/identity/infrastructure/security/SecurityConfig.java:28)
- **OTP attempt-counter off-by-one.** `EmailChallengeStore.verify()` increments `attempts` and checks `> MAX_ATTEMPTS` *before* comparing the code — a correct code submitted on the 6th try is rejected as `ATTEMPTS_EXCEEDED` without ever being checked. [EmailChallengeStore.java](backend/src/main/java/com/viego/identity/infrastructure/redis/EmailChallengeStore.java)
- **Failed token refresh doesn't sign the user out.** `client.ts`'s `doRefresh()` clears stored tokens on failure but never calls `sessionStore.signOut()`, so the app keeps rendering itself as signed-in with no valid session (US3 Acceptance Scenario 4 is unmet). [client.ts:35-38](mobile/app/shared/api/client.ts:35)
- **Infra outages are treated as invalid sessions.** Same `doRefresh()` clears tokens on *any* non-2xx, including 5xx from a Redis/DB outage — a transient blip force-logs-out the user instead of preserving the session. [client.ts:35-38](mobile/app/shared/api/client.ts:35)
- **Session marked "signed in" before tokens persist.** `login.tsx`/`register.tsx` call `setTokens(...)` without `await`/`.catch()`, then immediately navigate — a `SecureStore` write failure leaves the user shown as logged in with no actual tokens. [login.tsx:39-45](mobile/app/(auth)/login.tsx:39), [register.tsx:41-46](mobile/app/(auth)/register.tsx:41)
- **`AuthRateLimiter` can take down all auth traffic.** Redis calls in `preHandle` are unguarded; a Redis connection failure throws unhandled, turning a transient outage into a hard 500 on every login/register/refresh request instead of the documented fail-open behavior. [AuthRateLimiter.java:44-63](backend/src/main/java/com/viego/identity/infrastructure/security/AuthRateLimiter.java:44)
- **No global exception handler in the identity module.** `DataIntegrityViolationException` (concurrent duplicate registration), Redis `DataAccessException`, and invariant-break `IllegalStateException`s all bubble to Spring's default handler with zero application logging — no `@RestControllerAdvice` exists anywhere in `backend/src/main/java`.
- **The core "no anonymous access" requirement is untested.** `ExplorerControllerTest` injects the JWT principal directly rather than exercising the real security filter chain; no test sends a missing/malformed/expired token to a protected endpoint and asserts 401. This is the requirement (FR-014, NFR-SEC-01/02) the feature exists to enforce.

## Important Issues (14 found)

- Google OIDC nonce is generated with `Math.random()` and never forwarded to/validated by the backend — security theater. [useGoogleSignIn.ts:26-28](mobile/app/shared/api/useGoogleSignIn.ts:26), [GoogleIdTokenVerifier.java:45-48](backend/src/main/java/com/viego/identity/infrastructure/security/GoogleIdTokenVerifier.java:45)
- `Preferences` is an anemic entity with two construction paths that produce different results (`Preferences.builder()` vs. `new Preferences(id)`); the only thing preventing nulled defaults is a source comment. [Preferences.java](backend/src/main/java/com/viego/identity/domain/Preferences.java)
- `authTokenStore.ts` has no `TokenPair` type; `setTokens`/`clearTokens` use non-atomic `Promise.all`, so a partial write can leave a mismatched access/refresh pair. [authTokenStore.ts](mobile/app/shared/api/authTokenStore.ts)
- `GoogleIdTokenVerifier.verify()` catches bare `Exception` with no logging, collapsing a transient JWKS outage and a tampered token into the same unhelpful error. [GoogleIdTokenVerifier.java:45-57](backend/src/main/java/com/viego/identity/infrastructure/security/GoogleIdTokenVerifier.java:45)
- `useGoogleSignIn` only handles the `success` response type — `error`/`cancel`/`dismiss` are silently ignored, so the Google button appears to do nothing when a user backs out or hits an OAuth error. [useGoogleSignIn.ts:33-37](mobile/app/shared/api/useGoogleSignIn.ts:33)
- `ProfileScreen`'s optimistic preferences update rolls back silently on failure — no toast, no log. [ProfileScreen.tsx:34-52](mobile/app/screens/ProfileScreen.tsx:34)
- `SignInRequest` enforces "email+code required together" / "token required" only via scattered controller null-checks, no `@Valid`/conditional validation, unlike sibling DTOs.
- `RefreshTokenRotationStore` reads/writes untyped Redis hash fields; a missing `accessJti` would flow `null` into `revocationStore.revoke(null, ttl)` unguarded.
- Dead code left behind: `validateRegister`/`RegisterFields` and the `identity.register.name` translation key are unused now that `register.tsx` uses the passwordless flow; `sessionStore.ts`'s docblock still describes the old mock-only design this PR replaces.
- `JwtService`, `AuthRateLimiter`, `GoogleIdTokenVerifier`, `RevocationStore`, and `EmailChallengeStore`/`Service` have no direct unit tests — the reuse-detection and rate-limiting paths have never actually executed in this dev sandbox per the tests' own docstrings.
- `HandleGenerator`'s check-then-insert has a TOCTOU race on concurrent registrations sharing a generated handle; funnels into the missing exception handler above.
- No boundary tests at the controller layer for out-of-enum `theme`/`language` or malformed email.
- The Maestro e2e flow's assertion for the reinstall/preferences-persistence scenario — this PR's headline acceptance criterion — is commented out with a TODO.
- `validation.ts`'s `isValidCode` is exported but never called, so there's no client-side format check on the OTP field before it round-trips to the server; no dedicated test file for the validators.

## Suggestions (5 found)

- `RevocationStore`'s class doc duplicates `handoff-us3.md`'s design rationale at length — trim to a pointer so the two don't drift.
- `client.ts`/`auth.ts` doc comments attribute a convention to `plan.md` that actually lives in `tasks.md` — minor citation fix, duplicated in both files.
- `ExplorerRegistered`/`PreferencesUpdated` records have no compact-constructor validation (`new ExplorerRegistered(null, "", null)` compiles).
- `PreferencesUpdated` is built from the pre-save method arguments rather than the persisted entity — currently coincidentally correct, would silently drift if `update()` ever normalizes a value.
- `_layout.tsx`'s `SplashScreen...catch(() => {})` empty catches are inconsequential but worth a one-line comment explaining why they're intentionally swallowed.

## Strengths

- Comment quality is unusually high across the diff — every checked factual claim (config defaults, FR/task-ID references, ADR citations) held up; no comment rot found.
- `RefreshTokenRotationStore.rotate()` cleanly centralizes the compare-and-swap and distinguishes `ROTATED` vs. `REUSE_DETECTED`.
- Backend tests consistently tie back to FR/SC numbers and verify event-publish *counts*, not just "was called."
- Mobile tests query by role/label/testID per project convention rather than snapshotting implementation details.
- Mobile↔backend contract alignment was verified field-by-field against the OpenAPI spec and matches.
- The Cucumber suite reads the OTP directly out of Redis to test the real flow rather than adding a test-only backdoor to production code.

## Recommended Action

1. Fix the token-type confusion first — it's the single highest-severity finding (30-day blast radius instead of 15 minutes on a leaked token).
2. Fix the `EmailChallengeStore` off-by-one and the session-expiry-recovery gap (`doRefresh` → `sessionStore.signOut()`).
3. Add the `@RestControllerAdvice` for the identity module and guard `AuthRateLimiter`'s Redis calls so infra hiccups produce logged, actionable responses instead of crashing auth traffic or silently logging users out.
4. Add the missing anonymous-access test through the real security filter chain plus direct unit tests for `JwtService`, `AuthRateLimiter`, `GoogleIdTokenVerifier`, and the email-challenge store/service.
5. Work through the Important-tier list (nonce, `Preferences`/`authTokenStore` type safety, Google Sign-In error handling, dead code) as merge-readiness allows.
6. Re-run this review after fixes; hold off on `/speckit.review.simplify` until the critical/important items land — the code isn't in a "passing" state for a polish-only pass yet.