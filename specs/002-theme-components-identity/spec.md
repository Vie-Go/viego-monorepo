# Feature Specification: Theme, Component Base & First-Launch Identity Flow

**Feature Branch**: `002-theme-components-identity`

**Created**: 2026-07-23

**Status**: Draft

**Input**: User description: "create a new spec for create theme, components base and Screens — Identity follow docs @docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document. This will be foundation for future feature development on mobile. Please follow @prototype ui and component set also." Refined: "refine the spec, I want to first build the components set and theme follow @prototype, setup needed dependencies to prepare for future development and build a first explorer screen language change, first-launch setup (not wiring to backend api, just mock data first) then go to a blank main page, not build profile, snap page or map in this spec."

## Overview

This feature establishes the visual, interaction, and project **foundation** the mobile app is
built on — and proves it end-to-end with the smallest real flow: choosing a language and getting
a new or returning Explorer past first launch.

In scope:

1. **Theme** — the single light/dark visual language (color, type, spacing, shape) used by every
   future screen.
2. **Component base** — the reusable UI building blocks (buttons, inputs, cards, chips, toggles,
   etc.) every future screen assembles from.
3. **Project & tooling setup** — the dependencies and scaffolding (navigation, state,
   localization, animation, fonts/icons) later features need already in place.
4. **First-launch identity screens** — Language Select, Log in, Register, and Onboarding, running
   against **mock/local data only** (no live backend calls).
5. A **blank main placeholder screen** that the Explorer lands on once first launch (or a
   returning sign-in) completes, proving the handoff out of the Identity flow works.

Explicitly **out of scope** for this feature (deferred to later specs): Profile & Preferences,
Snap/Camera capture, and Map/Exploration. No functional tab bar, home feed, or profile screen is
built here — only the blank placeholder landing screen described above.

Source of truth: the
[UI/UX Design Document](../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/)
(design system, component specs, and `screens/identity.md`), ported 1:1 from the
[interactive prototype](../../prototype/VieGo.dc.html) ("viego"), and the tooling decisions already
recorded in [Phase 0's plan](../001-phase-0-walking-skeleton/plan.md).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Explorer picks their language (Priority: P1)

A person opens the app for the very first time and is asked to pick the language they want the
app in before anything else happens.

**Why this priority**: The literal front door — it is the first screen anyone ever sees, and every
later screen's text depends on this choice.

**Independent Test**: Fresh install (no stored language) → the language screen appears with one
option pre-selected → pick a different one → continue. Delivers a demonstrable, standalone
language-selection experience with no dependency on accounts or any other screen.

**Acceptance Scenarios**:

1. **Given** a fresh install with no stored language preference, **When** the person opens the
   app, **Then** a language selection screen appears with one language pre-selected (matching the
   device's language when supported, otherwise English) and a list of alternatives to choose from.
2. **Given** the person is on the language screen, **When** they select a different language,
   **Then** the screen's own text updates immediately to reflect the new choice (no restart
   needed).
3. **Given** the person has picked a language, **When** they tap Continue, **Then** the choice is
   remembered and they move on to sign in / create account.

---

### User Story 2 - New Explorer completes first-launch setup with mock data (Priority: P1)

Right after picking a language, a new person creates an account and is walked through a short
introduction to what the app does — all using mock/local data, with no live backend involved —
before landing on the app's blank main placeholder screen.

**Why this priority**: This is the rest of the front door. Without a working (even if mocked)
create-account → onboarding → landing path, nobody can get into the app at all.

**Independent Test**: From the language screen, register a new account with local/mock
validation only, move through the introduction, and arrive at the blank main placeholder screen.
Delivers a complete, demonstrable path from stranger to "inside the app" with zero backend
dependency.

**Acceptance Scenarios**:

1. **Given** the person is on the create-account screen, **When** they submit a valid name, email,
   and password, **Then** a mock/local account record is created (no network call is made) and
   they proceed to the introduction.
2. **Given** the person submits a registration with an email already used by another mock/local
   account, **When** they submit, **Then** they see a clear, plain-language "already in use" error
   and no duplicate mock account is created.
3. **Given** the person is viewing the introduction, **When** they reach the final step and confirm
   they're ready, **Then** they land on the blank main placeholder screen and the introduction is
   never shown again on later launches.
4. **Given** the person leaves an introduction step unfinished (e.g., backgrounds the app) and
   returns, **When** they reopen the app, **Then** they resume at a sensible point without losing
   their new mock account.

---

### User Story 3 - Returning Explorer signs back in with mock data (Priority: P2)

Someone who already has a mock/local account opens the app again (or was signed out) and signs
back in, landing directly on the blank main placeholder screen without repeating onboarding.

**Why this priority**: Depends on Story 2 existing (an account to sign back into) but is otherwise
a separate, equally necessary path — a product that can only create accounts and never sign
people back in is unusable past the first session.

**Independent Test**: With an existing mock/local account, open the sign-in screen, submit valid
credentials, and land directly on the blank main placeholder screen (skipping the introduction).

**Acceptance Scenarios**:

1. **Given** a person with an existing mock/local account, **When** they submit the matching email
   and password on the sign-in screen, **Then** they are taken straight to the blank main
   placeholder screen without seeing the introduction again.
2. **Given** a person submits an incorrect password or an unrecognized email, **When** they submit
   the form, **Then** they see a clear, plain-language error and their entered email is preserved
   so they don't have to retype it.
3. **Given** a person is on the sign-in screen, **When** they choose "Create account" instead,
   **Then** they move to the registration screen; **When** they choose "Log in" from registration,
   **Then** they return to sign-in.
4. **Given** a person picks an alternative sign-in option that isn't active yet, **When** they tap
   it, **Then** it visibly communicates it isn't available rather than failing silently or
   crashing.

---

### User Story 4 - Every screen is consistent, legible, and accessible (Priority: P3)

Anyone using the app — regardless of chosen theme, language, motion sensitivity, or assistive
technology — experiences the same visual language and can complete every screen built in this
feature.

**Why this priority**: A quality/consistency guarantee layered on top of Stories 1–3 rather than a
new path; it can be verified once the other stories exist, and gaps here degrade every other
feature built on this foundation later.

**Independent Test**: Sweep the language, sign-in, register, onboarding, and placeholder main
screens in both themes, both shipped languages, with reduced motion on, and with a screen reader,
confirming full legibility and operability without touching any other module.

**Acceptance Scenarios**:

1. **Given** any screen built in this feature, **When** viewed in light or in dark theme, **Then**
   all text, controls, and imagery remain fully legible with no missing or unreadable content.
2. **Given** any screen built in this feature, **When** viewed in Vietnamese or English, **Then**
   all text fits its space without being cut off or overlapping other elements.
3. **Given** an Explorer has reduced motion enabled at the device level, **When** they move through
   any screen (including the introduction and any pulsing elements), **Then** transitions and
   effects appear as instant state changes instead of animating.
4. **Given** an Explorer using a screen reader, **When** they navigate any screen, **Then** every
   interactive control announces a meaningful name and state (selected, disabled, error, etc.).

---

### Edge Cases

- What happens when the person backgrounds or closes the app mid-language-selection or
  mid-registration? On relaunch they resume at a sensible step; no mock account is lost or
  duplicated.
- What happens when someone registers with an email already used by a mock/local account? A
  clear, specific error is shown and no duplicate account is created.
- What happens if the Explorer switches theme while mid-way through filling in the sign-in or
  registration form? Entered field values are preserved across the theme change.
- What happens when an alternative sign-in provider isn't wired up yet? The option is visibly
  present but clearly non-interactive, not silently broken.
- What happens when the device's system language isn't one of the supported languages? The app
  falls back to English rather than showing blank or broken text.
- What happens on very small or very large phone screens, or after a device rotation? Every
  control stays reachable and nothing is cut off.
- What happens when the person reaches the blank main placeholder screen? It renders using the
  same theme/typography as the rest of the app (not an unstyled crash-like blank) even though it
  has no real content or navigation yet.
- What happens when the app is relaunched after an Explorer has already completed first launch?
  It skips straight to sign-in (or directly to the placeholder main screen if the mock session is
  still valid) rather than re-showing language selection or onboarding.

## Requirements *(mandatory)*

### Functional Requirements

**Project & tooling foundation**

- **FR-001**: The mobile project MUST have the navigation, state-management, localization,
  animation, and font/icon tooling identified in the technical plan
  ([plan.md](../001-phase-0-walking-skeleton/plan.md)) installed and configured before any screen
  in this feature is built, so this and later features do not need to re-scaffold the project.
- **FR-002**: The project setup MUST make the light/dark theme and the component base (below)
  available to any screen via a single shared mechanism, so no screen defines its own one-off
  colors, spacing, or controls.

**Theme foundation**

- **FR-003**: The app MUST support both a light and a dark visual theme, applied consistently
  across every screen built in this feature.
- **FR-004**: The app MUST persist the active theme across app restarts.
- **FR-005**: When no theme preference is stored yet (first launch), the app MUST default to the
  device's system-level light/dark preference, and MUST follow subsequent system-level theme
  changes automatically (no in-app theme switch is built in this feature — that control ships with
  the future Profile & Preferences feature).
- **FR-006**: The app MUST apply one consistent color, typography, spacing, and shape language
  across every screen so all screens read as one product.
- **FR-007**: Every screen built in this feature MUST render fully and correctly in both the light
  and the dark theme, with no unreadable, missing, or mis-colored content in either.

**Component base**

- **FR-008**: The app MUST provide a reusable primary call-to-action control, used identically
  everywhere a screen's main action appears (e.g., Continue, Log in, Create account, Get started).
- **FR-009**: The app MUST provide a reusable secondary/alternative-emphasis action control,
  visually distinct from the primary action, for non-primary confirmatory actions.
- **FR-010**: The app MUST provide a reusable text-entry control with clearly distinguishable
  idle, focused, filled, error, and disabled states, used identically across every form in the
  app.
- **FR-011**: The app MUST provide a reusable selectable-row (single-choice) control for pick-one
  lists such as the language picker, with a clear selected-vs-unselected visual state.
- **FR-012**: The app MUST provide a reusable card/container style for grouping related content.
- **FR-013**: The app MUST provide a reusable on/off toggle control for binary preferences, ready
  for future screens even though no screen in this feature exposes a toggle to the Explorer yet.
- **FR-014**: The app MUST provide a reusable settings/list-row control and a reusable compact
  stat-tile control, ready for future screens (e.g., the future Profile feature) even though none
  is populated with real data in this feature.
- **FR-015**: The app MUST provide a reusable circular avatar element that shows either an image
  or an initial-based fallback.
- **FR-016**: The app MUST provide a reusable step/progress indicator for multi-step flows (used
  by the introduction).
- **FR-017**: Every interactive control MUST meet a minimum comfortable touch-target size suitable
  for one-handed mobile use.

**Language Select**

- **FR-018**: The app MUST let a new Explorer choose an interface language from the supported set
  before reaching any other screen, pre-selecting the device's language where supported and
  English otherwise.
- **FR-019**: The chosen language MUST take effect immediately and persist across app restarts.

**Log in / Register (mock data only)**

- **FR-020**: Sign-in, registration, and the resulting session in this feature MUST use
  locally-simulated (mock) account and session data only; no live backend authentication call is
  made. Wiring these screens to a real authentication API is a separate, later feature.
- **FR-021**: The app MUST let a returning Explorer sign in with an email and a password, checked
  against mock/local account data.
- **FR-022**: The app MUST let a new person register an account with a name, an email, and a
  password, stored as mock/local account data.
- **FR-023**: The app MUST validate submitted sign-in/registration input and present clear,
  plain-language feedback for invalid input or a failed attempt, without discarding what the
  person already entered.
- **FR-024**: The app MUST mask password entry by default and let the person reveal it on demand.
- **FR-025**: The app MUST offer at least one alternative (non-email/password) sign-in option,
  with room reserved for additional options that may be visibly present but inactive if not yet
  available, clearly communicated as such; selecting an active alternative option completes with
  mock/local session data, same as email/password.
- **FR-026**: The app MUST let a person move freely between the sign-in and registration screens.
- **FR-027**: Account creation MUST NOT be considered complete until the Explorer has acknowledged
  the app's terms/privacy notice via a lightweight, non-blocking consent line shown on the
  registration screen.
- **FR-028**: The sign-in screen MUST present a password-recovery entry point; in this feature it
  is a visible, clearly-labeled link that is not yet backed by a working recovery flow (that flow
  ships in a later feature).

**Onboarding**

- **FR-029**: The app MUST present a short, multi-step introduction to a person immediately after
  their first successful (mock) registration, and MUST NOT show it again once completed.
- **FR-030**: The app MUST let the person advance through the introduction either by an explicit
  action or by swiping between steps.

**Blank main placeholder**

- **FR-031**: Once a new Explorer completes onboarding, or a returning Explorer signs in, the app
  MUST land them on a single placeholder main screen confirming the flow completed successfully.
- **FR-032**: The placeholder main screen MUST use the same theme, typography, and shared
  component styling as the rest of the app, even though its content is a stand-in for future
  features (no Map, Beats, Camera, Discover, or Profile functionality is built here).
- **FR-033**: On a subsequent app launch with a still-valid mock session, the app MUST skip
  straight to the placeholder main screen without re-showing language selection, sign-in, or
  onboarding.

**Cross-cutting quality**

- **FR-034**: Every screen built in this feature MUST be fully readable and usable in both of the
  app's two shipped languages (Vietnamese and English) at launch.
- **FR-035**: Every interactive control MUST be operable via assistive technology (e.g., a screen
  reader) with a meaningful, spoken-out name and state.
- **FR-036**: The app MUST honor a person's reduced-motion preference by replacing animated
  transitions and celebratory effects with instant equivalents across every screen in this
  feature.

### Key Entities

- **Explorer (mock)**: A locally-simulated account record used by this feature only. Key
  attributes: display name, email, password (mock, not securely handled — real credential storage
  is a later feature's concern), chosen language, and onboarding-completed flag.
- **Language Preference**: The Explorer's chosen interface language (one of the supported set),
  stored so it survives app restarts and is independent of the theme preference.
- **Theme Preference**: The active light/dark appearance, stored so it survives app restarts and
  applies app-wide; in this feature it is set automatically from the device, not by a manual
  in-app control.
- **Session (mock)**: The Explorer's signed-in/signed-out state and whether they've completed the
  one-time introduction, held locally with no backend counterpart in this feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time person can go from opening the app to landing on the blank main
  placeholder screen (language selection → account creation → introduction) in under 3 minutes.
- **SC-002**: A returning Explorer can sign in and reach the blank main placeholder screen in
  under 30 seconds under normal conditions.
- **SC-003**: 100% of screens built in this feature display with no visual defects in both the
  light and dark theme.
- **SC-004**: 100% of screens built in this feature display with no truncated or overlapping text
  in either shipped language.
- **SC-005**: 100% of interactive controls across these screens meet the minimum comfortable
  touch-target size.
- **SC-006**: When the device's system theme changes (light ↔ dark), every screen in this feature
  reflects the change without an app restart.
- **SC-007**: A screen-reader user can complete language selection, registration, and sign-in
  relying solely on spoken labels, encountering zero unlabeled interactive elements.
- **SC-008**: In a review with non-technical participants, at least 90% correctly understand what
  to do next after seeing a validation or sign-in error message.
- **SC-009**: A developer starting a brand-new future screen can build it using only the
  components and theme delivered by this feature, with zero one-off colors, spacing, or controls
  needed.

## Assumptions

- The visual language (crimson/gold palette, Urbanist typeface, rounded pill/card shapes, ambient
  shadows) and the exact screen anatomy follow the existing
  [design system](../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/design-system.md)
  and [`screens/identity.md`](../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/screens/identity.md)
  verbatim — this spec does not reinterpret product decisions already made there.
- "Components base" covers the full core UI and navigation/chrome component sets documented in
  [`components/core.md`](../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/components/core.md)
  and [`components/navigation.md`](../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/components/navigation.md)
  (buttons, inputs, cards, chips, badges, avatars, toggles, list rows, tab bar, screen header,
  bottom sheet, segmented control, etc.) even though this feature's screens only exercise a subset
  of them — because this feature is explicitly the shared foundation later modules (Exploration,
  Content, Engagement, Social, and the future Profile screen) build on. Map-specific components
  are excluded (owned by the Exploration module).
- "Project & tooling setup" means installing/configuring the dependencies already decided in
  [Phase 0's plan](../001-phase-0-walking-skeleton/plan.md) and its referenced ADRs (navigation,
  client/server state, localization, animation, fonts/icons) — this spec does not re-decide
  tooling choices, only requires them to be in place before/while building the screens above.
- The supported language set at launch is the five locales named in the design doc (Vietnamese,
  English, Korean, Japanese, French); Vietnamese and English are the two verified for full-string
  parity per SC-004/FR-034, matching the [localization](../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/localization.md) rules.
- The Onboarding introduction is exactly three steps and includes a "Skip" action, matching the
  live [interactive prototype](../../prototype/VieGo.dc.html) exactly (the design doc's earlier
  "no skip" default is superseded by prototype fidelity — see
  [plan.md](plan.md)/[research.md](research.md) R10).
- **Out of scope for this feature** (deferred to later specs): Profile & Preferences (including
  the manual dark-mode toggle, language-change entry point, streak/collection stats), Snap/Camera
  capture, Map/Exploration, Notifications (Engagement module), and the post-signup "Add friends"
  screen (Social module). After first launch or sign-in, the Explorer reaches only the blank main
  placeholder screen described in FR-031–033 — not a functional tab bar or home feed.
- Sign-in, registration, and session state in this feature are entirely mock/local (in-memory or
  on-device only, per FR-020); no live backend call is made because the Identity backend module is
  still an empty skeleton at this point in delivery. A later feature replaces the mock data layer
  with real API calls without changing the screens' visual contract.
