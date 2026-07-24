# Quickstart: Identity — Live Authentication & Preferences

**Feature**: Identity — Live Authentication & Preferences
**Branch**: `004-identity-auth-backend`
**Date**: 2026-07-24

## Prerequisites

- Everything [`003-modular-database-schemas`](../003-modular-database-schemas/quickstart.md) needs
  (Postgres 16+ with the 5 schemas migrated) — already true in this repo.
- **Redis** (new for this feature — [research R4](research.md#r4--refresh-token-rotation-revocation-and-rate-limiting-redis)),
  reachable locally the same way Postgres is (Docker container is fine; no compose file is
  currently checked into the repo, so run one directly: `docker run -p 6379:6379 redis:7`).
- A **Google OAuth client id** for verifying Google ID tokens
  ([research R2](research.md#r2--verifying-the-google-id-token)) — a dev/test-only OAuth client is
  sufficient locally.

## 1. Environment variables (new for this feature)

Following the existing `${VAR:default}` convention in
[`application.yml`](../../backend/src/main/resources/application.yml):

| Variable | Local default | Purpose |
|---|---|---|
| `REDIS_URL` | `redis://localhost:6379` | Refresh-token rotation, revocation denylist, rate-limit counters, email OTP challenges |
| `JWT_SIGNING_SECRET` | a dev-only fixed value (never committed as a real secret; see NFR-SEC-03) | HMAC key signing/validating VieGo's own access + refresh JWTs (R1) |
| `GOOGLE_OAUTH_CLIENT_ID` | (test OAuth client) | Expected `aud` claim when verifying a Google ID token (R2) |
| `EMAIL_CHALLENGE_SENDER` | `console` | Which `EmailChallengeSender` bean sends the OTP — `console` logs the code instead of emailing it, since no transactional-email provider is decided yet (R3) |

## 2. Sign in end-to-end (Email, passwordless)

```bash
# 1. Request a code — logged to the backend console locally (EMAIL_CHALLENGE_SENDER=console)
curl -X POST http://localhost:8080/api/v1/auth/email/challenge \
  -H 'Content-Type: application/json' \
  -d '{"email":"explorer@example.com"}'
# → 202 Accepted

# 2. Complete sign-in with the code from the backend logs
curl -X POST http://localhost:8080/api/v1/auth/email \
  -H 'Content-Type: application/json' \
  -d '{"email":"explorer@example.com","code":"123456"}'
# → 200, { accessToken, refreshToken, explorer: { id, handle, displayName, preferences: { language: "vi", theme: "light" }, ... } }
```

Sign in again with the **same email** (repeat step 2 after a fresh challenge) and confirm the
response's `explorer.id` and `handle` are **identical** to the first call — this is the
FR-002 / SC-002 check ("exactly once" registration) done by hand.

## 3. Preferences round-trip (the `@ready` gate scenario)

```bash
curl -X PUT http://localhost:8080/api/v1/explorers/me/preferences \
  -H "Authorization: Bearer $ACCESS_TOKEN" -H 'Content-Type: application/json' \
  -d '{"language":"vi","theme":"dark"}'
# → 200, echoes back { language: "vi", theme: "dark" }

curl http://localhost:8080/api/v1/explorers/me -H "Authorization: Bearer $ACCESS_TOKEN"
# → preferences.language == "vi" && preferences.theme == "dark"
```

Sign in again from a "different device" (a second, independent `/auth/email` call, same email) and
confirm `GET /explorers/me` shows the same `vi`/`dark` values with **no** re-entry — this is
[User Story 2](spec.md#user-story-2---preferences-follow-the-explorer-not-the-device-priority-p1)'s
independent test.

## 4. Refresh rotation + reuse detection (FR-013)

```bash
# Rotate once — succeeds, returns a new refreshToken
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Authorization: Bearer $OLD_REFRESH_TOKEN"
# → 200, new Session

# Replay the SAME (now-superseded) refresh token
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Authorization: Bearer $OLD_REFRESH_TOKEN"
# → 401 — the whole rotation family is revoked; the NEW refresh token from the successful
#   rotation above must also now fail if you try it, proving the family (not just the reused
#   token) was shut down.
```

## 5. Mobile: leaving mock data behind

1. Set `EXPO_PUBLIC_API_BASE_URL` to the backend from steps 1–4 (see
   [`shared/api/config.ts`](../../mobile/app/shared/api/config.ts) — already reads this env var).
2. Run the app; on `Login`/`Register`, use the (now passwordless) Email flow or the live Google
   button.
3. Confirm `mobile/app/shared/mock/explorerRepository.ts` is **not** on the call path for these
   screens (FR-017) — the easiest check is airplane mode: sign-in/preferences calls should now
   fail with the connectivity error from FR-018, not silently succeed against `AsyncStorage`.
4. Uninstall and reinstall the app (or clear it via Expo dev tools), sign in again with the same
   identity, and confirm the account/handle/preferences from step 3 above are exactly as left —
   [User Story 4](spec.md#user-story-4---the-app-runs-on-real-accounts-not-mock-data-priority-p2)'s
   independent test.

## 6. Automated checks this feature adds

```bash
cd backend
./mvnw test                       # unit + @DataJpaTest + @WebMvcTest + @ApplicationModuleTest
./mvnw test -Dtest=AuthenticationSteps   # Cucumber over authentication.feature (research R9)
./mvnw test -Dtest=ApplicationModulesTest  # module boundaries still verify() green
```

```bash
cd mobile
npm test                          # Jest + RNTL — updated identity screens, new authTokenStore
```
