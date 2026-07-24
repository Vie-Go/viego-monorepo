# Handoff: Phase 5 (US3 — An Explorer stays signed in through normal use)

**Status**: T033–T038 complete and marked `[X]` in [tasks.md](tasks.md).

## What's built

- `RefreshTokenRotationStore` — `identity:refresh:{familyId}` Redis hash (`refreshJti`, `accessJti`,
  `explorerId`). `rotate(familyId, presentedJti, newRefreshJti, newAccessJti)` returns
  `ROTATED`/`REUSE_DETECTED`/`NOT_FOUND`; on `REUSE_DETECTED` it deletes the whole family key
  immediately (so both the reused token *and* the most-recently-rotated one stop validating). No
  TTL — durability over memory pressure, per ADR-0007.
- `RevocationStore` — `identity:revoked:{jti}` presence-only denylist, TTL-bounded by the access
  token's remaining lifetime. **Not consulted on every authenticated request** — see Design
  decision below.
- `JwtService` extended: `issueRefreshToken(UUID, String familyId)` now stamps a `fid` claim (the
  no-family single-arg overload is gone — every refresh token belongs to a family from now on).
- `RefreshTokenService` — `issueInitialSession(explorerId)` mints access+refresh and seeds a fresh
  rotation family; `rotate(presentedToken)` validates signature+expiry, looks up the family, and
  either returns a new pair or `Optional.empty()` (401) on reuse/invalid/unknown-family.
- `AuthController` **rewired** (this phase, not new endpoints only): `toSession()` now calls
  `RefreshTokenService.issueInitialSession()` instead of `JwtService` directly — exactly the
  adjustment flagged as expected in [handoff-us1.md](handoff-us1.md)'s Gotcha #5. New
  `POST /auth/refresh`: reads `Authorization: Bearer <refreshToken>`, calls
  `RefreshTokenService.rotate()`, returns `200` + `Session` or `401` + Problem Details.
- Tests: `AuthRefreshControllerTest` (`@WebMvcTest`, 3/3 green — missing header, reuse/invalid
  token, successful rotation), `RefreshTokenServiceTest` (Testcontainers Redis — **not run in this
  sandbox**, see below). `AuthControllerTest`/`AuthContractTest` updated to mock
  `RefreshTokenService` instead of `JwtService` (their public behavior assertions are unchanged).

## Design decision: `RevocationStore` is populated but not (yet) enforced on every request

`RevocationStore.revoke()` is called when reuse is detected (denylisting the access token that was
issued alongside the reused refresh token), but **`SecurityConfig`'s JWT validation does not
consult it** on the authenticated-request hot path. This is deliberate, not an oversight — plan.md
is explicit that access-token validation "stays Redis-free... so it doesn't add a network hop to
every authenticated request" (Performance Goals). Populating the denylist without enforcing it
means: a reuse-detected access token is *recorded* as compromised but still validates
(signature+`exp` only) until it naturally expires (≤ `access-token-ttl`, 15m by default) — a bounded
window, not an open one. Wiring enforcement in would need either an extra Redis round-trip per
request (contradicts the stated goal) or a cached/short-poll denylist (an actual caching design,
out of this feature's scope). Flagging this explicitly rather than letting `RevocationStore` look
"finished" when only half its intended purpose is wired up.

## Verification performed

- `AuthRefreshControllerTest` — 3/3 green.
- Full non-Docker suite re-run: 21 passing / 4 pre-existing DB-dependent errors (same four, still
  not a regression).
- `RefreshTokenServiceTest` needs Docker (Testcontainers Redis via `com.redis:testcontainers-redis`
  — `com.redis.testcontainers.RedisContainer`) — not run here. Run
  `./mvnw test -Dtest=RefreshTokenServiceTest` in a Docker-capable environment before merging; it
  asserts the exact quickstart.md §4 scenario (rotate once → succeeds; replay the old token → 401;
  replay the *new* token too → 401, proving family-wide revocation).

## What's left

Phase 6 (US4 — mobile rewiring off the mock repository) and Phase 7 (polish). Proceeding to
Phase 6 next.
