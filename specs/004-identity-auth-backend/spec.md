# Feature Specification: Identity — Live Authentication & Preferences

**Feature Branch**: `004-identity-auth-backend`

**Created**: 2026-07-24

**Status**: Draft

**Input**: User description: "create new spec for identity-auth-backend in Phase 1 — Identity & foundations (Weeks 3–5) · ships. Read others related doc and codes before process and checkout to new branch also"

## Overview

This feature makes sign-in, account creation, and preferences **real** — closing out
[Phase 1 — Identity & foundations](../../docs/02-process-documentation/plans-estimates-schedules.md#phase-1--identity--foundations-weeks-35--ships-v02)
by replacing the mock/local identity flow built in
[`002-theme-components-identity`](../002-theme-components-identity/spec.md) with a live backend.
A visitor signs in with **Email or Google**, becomes a durable **Explorer** with a unique
**handle**, and their **language/theme preferences** follow them across sessions and devices. The
account tables and schema already exist ([`003-modular-database-schemas`](../003-modular-database-schemas/spec.md));
this feature is what makes them reachable, secure, and used — by the backend's live endpoints and
by the mobile app, which stops reading/writing its local mock account store and starts talking to
the real thing.

This is also the **first real feature** built contract-first end-to-end in this project, so it is
the proof that the pattern (agreed API contract → backend → mobile, with a durable event on every
meaningful state change) works before four more phases build on top of it.

Out of scope for this feature: Facebook and Zalo sign-in (fast-follow, may land in a later phase),
cross-provider account linking (open product decision, deferred), and any change to the visual
screens/flow already built in `002` (this feature changes what those screens talk to, not how they
look or step through).

Source of truth: [`authentication.feature`](../../docs/01-product-documentation/01-core-specifications/executable-specifications/features/identity/authentication.feature),
[Identity module design](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/design/identity.md),
[FR-ID requirements](../../docs/01-product-documentation/01-core-specifications/requirements/functional-requirements.md#fr-id--identity-authentication),
and [NFR-SEC requirements](../../docs/01-product-documentation/01-core-specifications/requirements/non-functional-requirements.md#nfr-sec--security--privacy).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A visitor signs in and becomes an Explorer (Priority: P1)

A person with no account opens the app, picks "Sign in with Google" (or Email), and — on
success — is a real, durably registered **Explorer** with a unique handle, without ever creating
or being asked for a password.

**Why this priority**: This is the front door for every other feature in the product. Nothing
else (capturing, streaks, friends) is reachable without it, and it is the gate for the rest of the
[critical path](../../docs/02-process-documentation/plans-estimates-schedules.md#critical-path--dependencies).

**Independent Test**: From a clean account, complete sign-in with Google (and separately with
Email), and confirm a new Explorer record exists server-side with a unique handle — independent of
any other feature (map, capture, friends) even existing yet.

**Acceptance Scenarios**:

1. **Given** a visitor with no existing account, **When** they sign in with Google, **Then** they
   are signed in as a new Explorer, are assigned a unique handle, and this is the only time this
   identity is ever registered.
2. **Given** a visitor with no existing account, **When** they sign in with Email, **Then** they
   are signed in as a new Explorer with a unique handle, without ever setting or entering a
   password.
3. **Given** an already-registered Explorer, **When** they sign in again with the same provider
   (same device or a new one), **Then** they are authenticated into their existing account — no
   second Explorer, and no second registration, is ever created.
4. **Given** a visitor presents an invalid, expired, or tampered provider credential, **When** they
   attempt to sign in, **Then** they see a clear, plain-language failure and no Explorer is created
   or signed in.
5. **Given** a visitor taps "sign in" repeatedly in quick succession or their request is retried
   after a dropped connection, **When** the sign-in ultimately succeeds, **Then** exactly one
   Explorer exists for that identity.

---

### User Story 2 - Preferences follow the Explorer, not the device (Priority: P1)

An Explorer sets their language and theme, then signs in on a different device (or reinstalls the
app), and sees the exact same language and theme — because the preference lives on their account,
not on the phone.

**Why this priority**: This is the concrete, testable proof that the account is real: a value set
in one session must be readable in a completely different session. It is called out by name as the
`@ready` gate for this phase in the executable spec.

**Independent Test**: Sign in, set language to "vi" and theme to "dark", sign out, sign back in on
a fresh app install/session, and confirm both values are exactly as left — with no dependency on
any other feature.

**Acceptance Scenarios**:

1. **Given** a signed-in Explorer, **When** they change their language or theme, **Then** the new
   value is saved to their account and reflected immediately in the app.
2. **Given** an Explorer who set language "vi" and theme "dark" in a previous session, **When**
   they sign in again on another device or after a reinstall, **Then** their language is "vi" and
   their theme is "dark" — read from their account, not re-entered.
3. **Given** a brand-new Explorer who has never set preferences, **When** they first sign in,
   **Then** they have a sensible default language and theme already set on their account.

---

### User Story 3 - An Explorer stays signed in through normal use (Priority: P2)

Once signed in, an Explorer keeps using the app across app restarts and over multiple days without
being repeatedly asked to sign in again, while a stolen or replayed session credential is detected
and shut down rather than silently accepted.

**Why this priority**: Depends on Story 1 (an account to hold a session for) but is a distinct
concern — a product that logs people out constantly, or that can't tell a legitimate session
renewal from a replayed/stolen one, is both unusable and unsafe. This is table-stakes session
behavior underneath every later feature.

**Independent Test**: Sign in once, exercise the app over a period spanning normal session
expiry, and confirm the Explorer is never forced to re-authenticate; separately, replay a
previously-used session-renewal credential and confirm it is rejected and that session's ability
to silently renew ends.

**Acceptance Scenarios**:

1. **Given** a signed-in Explorer using the app normally, **When** their short-lived session
   credential nears expiry, **Then** it is renewed automatically without interrupting them or
   asking them to sign in again.
2. **Given** an Explorer closes and reopens the app, **When** they return within their session's
   validity, **Then** they land back in the app already signed in.
3. **Given** a session-renewal credential that has already been used once, **When** it is
   presented again, **Then** the renewal is rejected and that session's ability to silently renew
   ends, protecting the account from a replayed/stolen credential.
4. **Given** an Explorer's session has fully expired (e.g., long inactivity), **When** they next
   open the app, **Then** they are asked to sign in again rather than seeing stale account data.

---

### User Story 4 - The app runs on real accounts, not mock data (Priority: P2)

Every first-launch and identity screen already built (language select, sign in, register,
onboarding, profile & preferences) works exactly as before from the Explorer's point of view, but
now reads and writes a real account instead of a local, on-device mock record.

**Why this priority**: Without this, Stories 1–3 exist only on the backend and deliver no visible
product change — the mobile app would keep behaving as if nothing shipped. This is what makes the
phase's outcome demonstrable end-to-end.

**Independent Test**: Repeat every acceptance scenario from `002-theme-components-identity`'s
sign-in/register/preferences flows against the live backend (no mock/local fallback), and confirm
the account and preferences survive an app reinstall.

**Acceptance Scenarios**:

1. **Given** the mobile app's sign-in, register, and profile/preferences screens, **When** an
   Explorer completes any of them, **Then** the result is visible in the real account (server-side)
   and not just in on-device storage.
2. **Given** an Explorer registers and completes onboarding, **When** they uninstall and reinstall
   the app and sign in again, **Then** their account, handle, and preferences are exactly as they
   left them.
3. **Given** the app can't reach the backend (offline or the service is down), **When** an Explorer
   tries to sign in or change a preference, **Then** they see a clear, plain-language connectivity
   error rather than a silent failure or a false success.

---

### Edge Cases

- What happens if two devices change the same Explorer's preferences at nearly the same time? The
  account ends up with one consistent, defined value (last write wins) — never a corrupted or
  partially-applied preference.
- What happens if the same person signs in with Google and, separately, with Email using the same
  email address? Per the [documented open decision](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/design/identity.md#open-decisions),
  they are treated as two separate Explorers until account linking is decided — this is expected
  behavior for this feature, not a bug.
- What happens when the chosen provider (e.g., Google) is unreachable? Sign-in with that provider
  fails clearly; it does not block sign-in with the other supported provider.
- What happens if handle generation would collide with an existing handle? The system resolves it
  automatically (e.g., a disambiguating suffix) — sign-in never fails because of a handle
  collision.
- What happens if an Explorer tries to read or change another Explorer's account or preferences?
  It is refused, regardless of how the request is made.
- What happens to Facebook as a sign-in option in this feature? It remains visibly present but
  non-functional/disabled, exactly as already built in `002`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST let a visitor sign in with **Email** or **Google** and, on success,
  become a signed-in **Explorer**.
- **FR-002**: System MUST create an Explorer **exactly once** per identity — a repeat sign-in with
  the same provider identity always authenticates the existing Explorer and never creates another
  one, including under retried or duplicated requests.
- **FR-003**: System MUST assign every newly-created Explorer a **unique handle** automatically at
  registration, resolving any naming collision without failing the sign-in.
- **FR-004**: The **Email** sign-in option MUST NOT require the Explorer to create, enter, or have
  stored a password — verification uses a mechanism (e.g., a one-time code or link) that keeps the
  product's "no stored passwords" commitment intact.
- **FR-005**: System MUST reject sign-in with an invalid, expired, or tampered provider credential,
  showing a clear, non-technical failure, with no Explorer created or signed in as a result.
- **FR-006**: System MUST record every new Explorer registration durably and immediately, in a way
  other parts of the product can later and reliably learn a given Explorer exists (foundation for
  every downstream module that provisions per-Explorer state).
- **FR-007**: A signed-in Explorer MUST be able to view and update their **language** and **theme**
  preferences.
- **FR-008**: Preference changes MUST persist on the Explorer's account and appear identically on
  every subsequent session and device that Explorer signs into.
- **FR-009**: System MUST record every preference change durably, the same way registration is
  recorded (FR-006).
- **FR-010**: A new Explorer MUST have a defined default language and theme from the moment their
  account is created, even before they make an explicit choice.
- **FR-011**: System MUST keep a signed-in Explorer signed in across normal app use (including app
  restarts) without repeated re-authentication, until their session naturally expires or they sign
  out.
- **FR-012**: System MUST silently renew an Explorer's session before it expires during normal,
  regular use, without interrupting them.
- **FR-013**: System MUST detect reuse of an already-used session-renewal credential and, when
  detected, reject the renewal and end that session's ability to silently renew again.
- **FR-014**: System MUST require a valid signed-in session for every identity operation except
  signing in itself — there is no anonymous access to account or preference data.
- **FR-015**: An Explorer MUST only ever be able to view or change their **own** account and
  preferences, never another Explorer's.
- **FR-016**: System MUST limit the rate of sign-in and session-renewal attempts to curb abuse.
- **FR-017**: Every mobile screen from `002-theme-components-identity` that currently reads or
  writes local/mock account data (language select's persisted choice, sign in, register,
  onboarding completion, profile & preferences) MUST instead read and write the real account
  produced by this feature, with no mock/local fallback remaining in the shipped app.
- **FR-018**: When the backend is unreachable, the app MUST show a clear, plain-language
  connectivity error on sign-in or preference changes rather than a silent failure or a false
  success.
- **FR-019**: System MUST NOT build Facebook or Zalo sign-in, or cross-provider account linking, in
  this feature — both remain explicitly out of scope (tracked as later, separate work).

### Key Entities *(include if feature involves data)*

- **Explorer**: A registered person using VieGo — has a unique handle, a display identity, and
  owns exactly one set of Preferences. Created exactly once per identity, on first successful
  sign-in.
- **Auth Provider Link**: The binding between an Explorer and one external sign-in method (Email or
  Google at this feature) that lets them prove who they are on a future sign-in. Never carries a
  password.
- **Preferences**: An Explorer's language and theme choice — exactly one per Explorer, replaced
  wholesale whenever changed, readable from any of that Explorer's sessions/devices.
- **Registration/Preference Record** *(event)*: A durable, timestamped record that a specific
  Explorer registered, or that a specific Explorer's preferences changed — the mechanism other
  parts of the product rely on to learn about these facts after they happen.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can go from choosing "Sign in with Google" or "Sign in with Email" to
  landing inside the app as a registered Explorer in under 5 seconds under normal network
  conditions.
- **SC-002**: 100% of repeat sign-ins by the same identity authenticate the existing Explorer — 0%
  result in a second/duplicate account, including under rapid repeated attempts or network retries.
- **SC-003**: 100% of the time, an Explorer's language and theme are identical the next time they
  sign in on any device or after a reinstall.
- **SC-004**: An Explorer can use the app continuously across a normal day without being asked to
  sign in more than once.
- **SC-005**: 0 passwords are ever stored for any Explorer account.
- **SC-006**: 100% of attempts to read or change another Explorer's account or preference data
  without authorization are refused.
- **SC-007**: Every first-launch and identity screen (language, sign in, register, onboarding,
  profile & preferences) completes its full journey against the real account with zero reliance on
  local/mock data, verified by the account and preferences surviving an app reinstall.
- **SC-008**: 100% of successful registrations and preference changes are still present and
  correct even if the app loses connectivity or crashes immediately afterward.

## Assumptions

- **Email sign-in is passwordless** (a one-time code or link sent to the Explorer's email), not a
  traditional email+password form. This follows directly from the product's existing "VieGo stores
  no passwords" commitment and means the password field in the mobile app's current mock
  login/register screens is removed or replaced with the passwordless flow as part of this
  feature's mobile integration (Story 4) — it is not carried forward from the mock UI as-is.
- **Handles are system-generated, not chosen.** A new Explorer's handle is derived automatically
  (e.g., from their display name or email) with automatic collision handling; picking or editing a
  custom handle is not part of this feature.
- **Facebook and Zalo stay out of scope** for this feature specifically, even though the
  executable spec's scenario outline lists Facebook as a provider example — per the phase plan,
  Facebook/Zalo are an explicit fast-follow. Facebook's button remains visible-but-disabled in the
  mobile app, unchanged from `002`.
- **Cross-provider account linking is out of scope.** The same person signing in with two
  different providers is treated as two separate Explorers until a future product decision
  resolves this (already an open decision in the identity module design, not something this
  feature decides).
- **The onboarding introduction's screens and steps are unchanged.** This feature swaps what data
  those screens read/write (mock → real); it does not redesign the flow itself.
- **Session and rate-limit thresholds** (how long a session lasts before expiry, how aggressively
  sign-in attempts are throttled) follow common practice for a consumer mobile app unless product
  direction says otherwise — exact values are a planning-level decision, not a scope question.
- **Reasonable, intermittent connectivity is assumed.** Full offline sign-in or offline account
  creation is out of scope; Story 4's connectivity requirement (FR-018) only covers showing a clear
  error when the backend is unreachable, not queuing/replaying identity actions offline.
