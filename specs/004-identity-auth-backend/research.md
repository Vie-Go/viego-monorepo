# Research: Identity — Live Authentication & Preferences

Phase 0 output for [plan.md](plan.md). Each item: **Decision → Rationale → Alternatives considered**.
Every decision is checked against what's already in the repo (existing dependencies, existing
Core Specifications, existing mobile mock code) so nothing here contradicts code that already
exists — where a real drift was found between docs and code, it's called out and reconciled rather
than silently picked one way.

## R1 — Session token issuance & verification

**Decision**: Spring Security + `spring-boot-starter-oauth2-resource-server`, configured as a
**self-issued JWT** resource server: VieGo signs its own access/refresh JWTs with an
app-owned **HMAC (HS256)** secret (single service, no need for asymmetric key distribution yet),
validated on every protected endpoint via `NimbusJwtDecoder.withSecretKey(...)` inside a
`SecurityFilterChain`. `io.jsonwebtoken:jjwt-api`/`jjwt-impl`/`jjwt-jackson` ("jjwt") issues the
tokens (claims: `sub`=explorerId, `jti`, `iat`, `exp`); Spring Security's resource-server filter
chain validates them on the way in, so endpoint protection, `Authentication` population, and error
mapping reuse a tested framework path instead of a hand-rolled filter.

**Rationale**: Matches the design doc's "Bearer JWT... Spring Security" and NFR-SEC-01
("Spring Security enforces Bearer JWT") without pulling in a full OAuth2 authorization server (no
external clients consume VieGo tokens; VieGo is the only party that ever mints or reads them).

**Alternatives considered**: Spring Authorization Server (rejected — built for acting as an OAuth2
provider to third-party clients, which VieGo isn't); hand-rolled `OncePerRequestFilter` with no
Spring Security resource-server support (rejected — reinvents tested request-pipeline wiring for
no benefit); asymmetric (RS256) signing (deferred — only pays off once a second service needs to
verify tokens without sharing a secret; revisit at service-extraction time per
[ADR-0014](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0014-uuidv7-primary-keys.md)'s
extraction posture).

## R2 — Verifying the Google ID token

**Decision**: `com.nimbusds:oauth2-oidc-sdk` (Nimbus OIDC SDK) to validate the Google-issued ID
token presented by the client: signature against Google's published JWKS
(`https://www.googleapis.com/oauth2/v3/certs`, fetched via a cached remote JWK set), `iss`
(`https://accounts.google.com`), `aud` (VieGo's Google OAuth client id), and `exp`. The verified
subject (`sub`) claim becomes the `AuthProvider.providerSubjectId` for `kind=google`.

**Rationale**: Nimbus's OIDC SDK is purpose-built for exactly this — a **relying party** verifying
a third-party OIDC provider's ID token — which is the literal phrase the identity design doc uses
("VieGo is an OIDC relying party"). Reusing the Nimbus family (also used for R1's local JWT
decoding) avoids a second, heavier SDK.

**Alternatives considered**: `google-api-client`'s `GoogleIdTokenVerifier` (rejected — pulls in the
full Google API client SDK for one verification call Nimbus already covers); trusting the token
unverified beyond a same-origin check (rejected outright — violates NFR-SEC-01/06).

## R3 — Email sign-in without a password

**Decision**: Email is **passwordless**, using a **one-time code (OTP)**. `POST
/api/v1/auth/email/challenge {email}` generates a 6-digit code, stores it in Redis
(`identity:otp:{normalizedEmail}`, short TTL, capped verify-attempts) and hands it to a pluggable
`EmailChallengeSender` port. The Explorer then completes sign-in via the existing `POST
/api/v1/auth/{provider}` with `{email, code}` (extended request schema — see
[contracts/rest-api.identity.openapi.yaml](contracts/rest-api.identity.openapi.yaml)); a verified
code plays the same role R2's verified Google token plays: the normalized email becomes
`AuthProvider.providerSubjectId` for `kind=email`.

For **this feature's dev-only exit** (v0.2, "Internal/dev" audience per the
[roadmap](../../docs/02-process-documentation/roadmaps-and-backlogs.md#release-train)), the sender
implementation logs the code server-side rather than integrating a transactional-email provider —
no email-delivery ADR exists yet in this repo, and picking a provider (SES, Postmark, ...) is a
standalone infrastructure decision that shouldn't be smuggled into an identity feature spec. The
port is designed so swapping in a real sender later is a one-class change, not a redesign.

**Rationale**: This is a **direct, spec-forced consequence** of an existing MUST requirement —
NFR-SEC-04, "VieGo stores no passwords" — combined with the mock mobile UI's password field
needing to go away (documented as an Assumption in [spec.md](spec.md)). No reasonable alternative
satisfies NFR-SEC-04 while still calling the option "Email".

**Alternatives considered**: Magic link (rejected for mobile-first UX — a link opens in a browser
and has to deep-link back into the app, which is more moving parts than a code the person types
back into the same screen they requested it from, for no real security gain here); storing a
salted password hash after all (rejected — directly violates NFR-SEC-04, a MUST).

## R4 — Refresh-token rotation, revocation, and rate limiting (Redis)

**Decision**: Add `spring-boot-starter-data-redis` (Lettuce) + a Testcontainers Redis module for
integration tests, implementing exactly the two roles [ADR-0007](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0007-redis-cache-and-token-rotation.md)
already describes for identity, under the `identity:*` key namespace:
- `identity:refresh:{familyId}` — the current rotation handle + lineage for one refresh-token
  family. Presenting a token whose handle doesn't match the current one revokes the whole family
  (reuse detection, FR-013).
- `identity:revoked:{jti}` — short-lived denylist for immediate access-token revocation, TTL-bounded
  by the access token's own lifetime (access tokens stay self-validating otherwise: signature +
  `exp`, no Redis round-trip on the common path).
- `identity:ratelimit:{ip}:{route}` — fixed-window `INCR`+`EXPIRE` counters guarding
  `/auth/*` (FR-016 / NFR-SEC-07).

This feature is the **first consumer** of ADR-0007, which is currently recorded as *Proposed*; this
plan treats it as the trigger to move it to *Accepted* (a follow-up task, not an edit to the ADR's
content — ADRs are immutable per constitution Principle V).

**Rationale**: Directly what the identity module design already specifies; reusing the
already-decided component instead of introducing a second one (e.g. a Postgres-backed token table)
keeps auth's hot-path dependency count at one.

**Alternatives considered**: A Postgres `refresh_tokens` table (rejected — ADR-0007 already weighed
this trade-off and chose Redis for the ephemeral, high-churn rotation workload; revisiting it here
would re-litigate an existing decision without new information); in-memory-only rotation state
(rejected — doesn't survive a restart or work across more than one backend instance).

## R5 — Handle generation

**Decision**: Derive a candidate handle from the identity's display name (Google) or the local
part of the email address (Email provider) — lowercase, non `[a-z0-9._]` characters stripped,
truncated to fit the existing `explorers.handle VARCHAR(32)` column — then check-and-retry with a
numeric suffix (`minhdinh`, `minhdinh2`, ...) inside the same transaction as Explorer creation. The
column's existing `UNIQUE` constraint ([V1__init_identity_schema.sql](../../backend/src/main/resources/db/migration/identity/V1__init_identity_schema.sql))
is the backstop that makes a collision impossible to miss.

**Rationale**: FR-ID-03/FR-003 requires a unique handle to exist the moment an Explorer is created;
nothing in any spec has the Explorer choose or type one at this feature, so generation must be
fully automatic and never fail sign-in.

**Alternatives considered**: Random opaque handle, e.g. `@explorer-7f3a` (rejected — every UI
mockup and the domain design's own example (`@minh.dq`) show a human-readable, name-derived handle;
an opaque one would need to be redone the moment a "customize your handle" feature lands).

## R6 — Google sign-in on the mobile client

**Decision**: `expo-auth-session`'s built-in Google provider (browser-based OAuth/OIDC code flow),
not a native Google Sign-In SDK.

**Rationale**: Every native-code package `002-theme-components-identity` added was chosen because
it's officially "Included in Expo Go" so the app never needed a dev-client build
([mobile/CLAUDE.md](../../mobile/CLAUDE.md)); `expo-auth-session` continues that — it's a
JS-only, browser-redirect flow, so it doesn't reopen the dev-client question this project has
deliberately avoided so far. The `SocialAuthButton` component and Google button already present in
`login.tsx`/`register.tsx` just gets a real `onPress` handler; no new UI is designed here.

**Alternatives considered**: `@react-native-google-signin/google-signin` (rejected for now — native
module, would force a dev-client build, a bigger change than this feature's scope; revisit if
product wants the native one-tap credential picker later).

## R7 — Where session tokens live on-device

**Decision**: Access + refresh JWTs go into `expo-secure-store` (Keychain on iOS, Keystore-backed
on Android), a new small `shared/api/authTokenStore.ts` module. `useSessionStore` (Zustand,
`AsyncStorage`-persisted) **keeps its exact current shape** (`explorerId`, `status`,
`onboardingCompletedAt`) — it already only ever held non-sensitive session *state*, never the mock
password hash, so nothing here needs to change about it; it just now gets driven by real API
responses instead of the mock repository, exactly as its own code comment already anticipated
("a later feature swaps the mock repository's internals for real auth without changing this
store's shape" — [sessionStore.ts](../../mobile/app/shared/store/sessionStore.ts)).

**Rationale**: Matches the identity module design's "access/refresh JWT in secure storage" and
keeps sensitive token bytes out of `AsyncStorage`, which is unencrypted on-device storage.

**Alternatives considered**: Keeping tokens in the existing `AsyncStorage`-backed Zustand store
(rejected — unencrypted; NFR-SEC-05 expects sensitive data protected at rest, and secure storage is
a one-package, low-cost fix).

## R8 — `theme` preference values: reconciling a real doc/code drift

**Finding**: The OpenAPI contract's `Preferences.theme` enum is `[light, dark]` — the identity
module design doc agrees (`{ language, theme: light|dark }`). But the already-merged JPA entity
([`Preferences.java`](../../backend/src/main/java/com/viego/identity/domain/Preferences.java))
defaults to `"system"`, a third value no spec documents.

**Decision**: The **contract is source of truth** (constitution Principle I) — an Explorer's saved
server-side preference is always a concrete `light` or `dark`, never `"system"`. At account
creation, the default is resolved from the device's *current* system appearance at that moment
(not a literal stored `"system"` sentinel). `Preferences.java`'s default is corrected from
`"system"` to `"light"` (the same default the mock flow's `themeStore` currently falls back to)
as part of this feature, with the drift flagged here rather than silently carried forward. A
signed-out visitor's device-follows-system behavior (pre-auth, before any account exists) is
untouched — it's a client-only concern this feature doesn't own.

**Alternatives considered**: Adding `"system"` to the OpenAPI enum instead (rejected — no spec
(Gherkin or design doc) describes "follow the device automatically forever, even as the device
changes" as an account-level preference; that's a materially different, unscoped feature, not a
one-line contract fix).

## R9 — Making `authentication.feature` executable (BDD)

**Decision**: Add `io.cucumber:cucumber-java`, `cucumber-spring`, `cucumber-junit-platform-engine`
(test scope) and step definitions under
`backend/src/test/java/com/viego/identity/cucumber/AuthenticationSteps.java`, running against a
`@SpringBootTest` context with Testcontainers Postgres + Redis. Only the `@ready`-tagged scenario
("Preferences persist across sessions") and the un-tagged `Scenario Outline` (Email/Google/Facebook
examples — Facebook rows explicitly asserting "not yet supported" per FR-019) gate CI; the
`@draft` account-linking scenario stays `@Ignore`d/pending, matching its own `@draft` tag and this
feature's explicit non-goal (FR-019).

**Rationale**: The phase's own exit criteria names this explicitly — "first real contract + BDD
tests in CI" — and the test strategy already designates Cucumber-over-Gherkin as the project's BDD
tool; no dependency exists yet because no feature has needed it before this one.

**Alternatives considered**: Testing the same scenarios only as plain `@SpringBootTest`/MockMvc
integration tests without Cucumber (rejected — satisfies the behavior but not the phase's explicit
"prove BDD wiring works" exit criterion, which is specifically about the Gherkin file executing,
not just the behavior existing).

## R10 — Contract change: an email challenge endpoint

**Finding**: R3's passwordless email flow needs a "send me a code" step, but
`rest-api.openapi.yaml` only has one identity sign-in endpoint (`POST /auth/{provider}`, body
`{token}`), which has nowhere to represent "send a code to this address."

**Decision**: Per constitution Principle V (spec-first: edit the Core Spec, then implement), this
plan **extends** `rest-api.openapi.yaml` (not `specs/004-.../contracts/` in isolation — the
canonical file) with:
- `POST /auth/email/challenge` — body `{email}` → `202 Accepted`, no session (this is not sign-in,
  just "a code was sent").
- `POST /auth/{provider}` request body gains two new **optional** properties, `email` and `code`
  (alongside the existing `token`), used only when `provider=email`; `token` stays required for
  `google`/`facebook`/`zalo`, unchanged.

Both changes are additive — no existing field, path, or required-ness is removed or narrowed, so
every already-agreed part of the contract (including the parts P2–P5 haven't built against yet)
keeps working unmodified. See [contracts/rest-api.identity.openapi.yaml](contracts/rest-api.identity.openapi.yaml)
for the extracted, identity-scoped excerpt this plan works from.

**Rationale**: The alternative — inventing this endpoint only in code — is exactly the
"behaviour MUST NOT be inferred from implementation" failure Principle I exists to prevent.

## R11 — Facebook/Zalo at the contract layer

**Decision**: Leave `facebook`/`zalo` in the OpenAPI `provider` path-parameter enum (the contract
already forward-declares the full target surface), but this feature's implementation returns a
`501 Not Implemented` Problem Details response for both — it does not narrow the contract to just
`email|google`. The mobile Facebook button stays visibly-present-but-disabled, unchanged from
`002`.

**Rationale**: FR-ID-08 already marks Facebook/Zalo as a later, separate fast-follow
(`identity-auth-facebook-zalo`, Phase 5) — narrowing the enum now would just widen it again later
for no benefit, and a `501` is a truer signal to any client than a `404` (the route exists; the
provider isn't wired up yet).

**Alternatives considered**: Narrowing the enum to `email|google` for this feature (rejected — see
above); silently 200-ing with a fake session for unsupported providers (rejected outright — would
let an unimplemented provider appear to work).
