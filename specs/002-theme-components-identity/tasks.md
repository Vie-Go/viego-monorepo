---

description: "Task list for Theme, Component Base & First-Launch Identity Flow"
---

# Tasks: Theme, Component Base & First-Launch Identity Flow

**Input**: Design documents from `/specs/002-theme-components-identity/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/component-contracts.md](contracts/component-contracts.md), [quickstart.md](quickstart.md)

**Tests**: Included. `mobile/CLAUDE.md` and this plan's Technical Context already commit this project
to Jest + React Native Testing Library for every component/screen and Maestro for cross-screen E2E
— this is standing project convention, not an ad hoc addition for this feature.

**Organization**: Tasks are grouped by user story (spec.md) to enable independent implementation and
testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- File paths are relative to the repository root

## Path Conventions

Mobile-only change within the existing `mobile/` Expo app (Phase 0 monorepo layout). All new/changed
files live under `mobile/`, per [plan.md](plan.md)'s Project Structure.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install and configure the tooling this and every later mobile feature builds on
(FR-001, FR-002; research.md R1, R5, R6, R8).

- [X] T001 Install all new dependencies in `mobile/package.json` per [quickstart.md](quickstart.md)
  (`expo-router`, `zustand`, `nativewind`, `tailwindcss`, `react-native-reanimated`,
  `react-native-worklets`, `react-native-gesture-handler`, `expo-linear-gradient`, `expo-blur`,
  `react-native-svg`, `expo-font`, `expo-splash-screen`, `@expo-google-fonts/urbanist`,
  `@react-native-async-storage/async-storage`, `lucide-react-native`)
- [X] T002 [P] Create `mobile/tailwind.config.js` encoding the VieGo Tailwind theme (palette,
  radius, spacing, font, shadow) from `design-system.md`, per research.md R1
- [X] T003 [P] Create `mobile/global.css` as the NativeWind Tailwind entrypoint
- [X] T004 [P] Update `mobile/babel.config.js` with the NativeWind babel preset
- [X] T005 [P] Update `mobile/metro.config.js` with the NativeWind metro wrapper
- [X] T006 [P] Register config plugins required by the new native-code packages (T001) in
  `mobile/app.json`'s `"plugins"` array
- [X] T007 Install React Native Reusables' copy-paste primitive components (`switch`, `radio-group`,
  `progress`, `avatar`, `separator`, `toggle`, `toggle-group`, `tabs`, `checkbox`) into
  `mobile/app/shared/ui/` via RNR's CLI installer, per [contracts/component-contracts.md](contracts/component-contracts.md)
  and quickstart.md's "React Native Reusables components" section

**Checkpoint**: Project tooling ready — theme/component/navigation work can now begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core theme, i18n, state, mock-data, and routing infrastructure every user story
depends on. **No user story work can begin until this phase is complete.**

- [X] T008 Extend `mobile/app/shared/theme/tokens.ts` to the full token set (palette, light, dark,
  radius, space, font, shadow) per [data-model.md](data-model.md) Theme and design-system.md
- [X] T009 Extend `mobile/app/shared/theme/ThemeProvider.tsx` to resolve from
  `Appearance.getColorScheme()` and follow subsequent system changes automatically (FR-003, FR-005;
  research.md R3)
- [X] T010 [P] Create `mobile/app/shared/store/themeStore.ts` — Zustand store with `persist`
  middleware (`@react-native-async-storage/async-storage`) for the resolved theme name (FR-004;
  research.md R3; data-model.md Theme)
- [X] T011 [P] Create `mobile/app/shared/store/languageStore.ts` — Zustand `persist` store for the
  active `LanguagePreference` (FR-019; data-model.md Language Preference)
- [X] T012 [P] Create `mobile/app/shared/store/sessionStore.ts` — Zustand `persist` store for the
  mock `Session` (`explorerId`, `status`, `onboardingCompletedAt`) (FR-033; data-model.md Session)
- [X] T013 Extend `mobile/app/shared/i18n/translations.ts` with Identity-screen strings (Language
  Select, Log in, Register, Onboarding, main placeholder) for `vi`/`en`, plus picker-only metadata
  (native label, code) for `ko`/`ja`/`fr` (FR-034; spec Assumptions)
- [X] T014 Extend `mobile/app/shared/i18n/I18nProvider.tsx` to read/persist the active locale via
  `languageStore` (T011) and pre-select the device locale when unset (FR-018)
- [X] T015 [P] Create `mobile/app/shared/mock/explorerRepository.ts` — mock account/session module:
  `register()` (with duplicate-email check), `login()` (credential check), backed by `AsyncStorage`,
  zero network calls (FR-020; research.md R9; data-model.md Explorer)
- [X] T016 Load Urbanist (weights 400/500/600/700/800) via `@expo-google-fonts/urbanist` +
  `expo-font` + `expo-splash-screen` (`preventAutoHideAsync` until fonts resolve) in
  `mobile/app/_layout.tsx` (research.md R5)
- [X] T017 Create `mobile/app/_layout.tsx` root layout: wraps the app in Theme/I18n providers and
  implements the routing guard from [data-model.md](data-model.md)'s state-transition diagram (no
  language → Language Select; no session → Log in; signed-in + onboarding complete → main)
- [X] T018 [P] Create stub route files `mobile/app/(auth)/language.tsx`,
  `mobile/app/(auth)/login.tsx`, `mobile/app/(auth)/register.tsx`,
  `mobile/app/(auth)/onboarding.tsx`, `mobile/app/main.tsx` (placeholder content only — real
  implementations land in their owning user-story phase below) so every route the routing guard
  (T017) can target already exists
- [X] T019 [P] Build `Button` (primary/ghost) component in `mobile/app/shared/ui/Button.tsx` —
  NativeWind-styled `Pressable`, no `@rn-primitives` equivalent (FR-008, FR-009)
- [X] T020 [P] Build `Input` component in `mobile/app/shared/ui/Input.tsx` — idle/focused/filled/
  error/disabled states (FR-010)
- [X] T021 [P] Build `Divider` component in `mobile/app/shared/ui/Divider.tsx`, sourced from the
  `separator` primitive (T007)
- [X] T022 [P] Build `IconButton` component in `mobile/app/shared/ui/IconButton.tsx` using
  `lucide-react-native` glyphs
- [X] T023 [P] Build `SocialAuthButton` component in `mobile/app/shared/ui/SocialAuthButton.tsx`,
  including its `disabled` (not-yet-wired-provider) visual state (FR-025)
- [X] T024 [P] Unit tests for `Button`/`Input`/`Divider`/`IconButton`/`SocialAuthButton` in
  `mobile/__tests__/ui/Button.test.tsx`, `Input.test.tsx`, `Divider.test.tsx`,
  `IconButton.test.tsx`, `SocialAuthButton.test.tsx` (states, accessibility roles, token usage)

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Explorer picks their language (Priority: P1) 🎯 MVP

**Goal**: A person opens the app for the first time and picks their interface language before
anything else happens.

**Independent Test**: Fresh install (no stored language) → the language screen appears with one
option pre-selected → pick a different one → Continue navigates onward. No dependency on accounts
or any other screen's real implementation (the target route exists as a stub from T018).

### Implementation for User Story 1

- [X] T025 [P] [US1] Build `SelectRow` component in `mobile/app/shared/ui/SelectRow.tsx`, sourced
  from the `radio-group` primitive (T007) — selected/unselected states, `accessibilityRole="radio"`
- [X] T026 [US1] Implement the Language Select screen in `mobile/app/(auth)/language.tsx`: brand
  lockup, bilingual headline, 5-locale `SelectRow` list, Continue pill (FR-016, FR-018;
  spec US1 acceptance scenarios 1–3)
- [X] T027 [US1] Wire language selection to `languageStore` (T011): device-locale pre-selection,
  immediate text update on pick, persistence, Continue → `/login`
- [X] T028 [P] [US1] Unit test the Language Select screen in
  `mobile/__tests__/screens/language.test.tsx` (pre-selection, selection, persistence, navigation)
- [X] T029 [P] [US1] Unit test `SelectRow` in `mobile/__tests__/ui/SelectRow.test.tsx`

**Checkpoint**: US1 independently testable — fresh install shows Language Select; selecting a
language persists it and Continue navigates onward.

---

## Phase 4: User Story 2 - New Explorer completes first-launch setup with mock data (Priority: P1)

**Goal**: A new person creates a mock account and moves through Onboarding to the blank main
placeholder screen, with zero backend calls.

**Independent Test**: From the language screen, register a new account with local/mock validation
only, move through the introduction (finish or Skip), and arrive at the blank main placeholder
screen.

### Implementation for User Story 2

- [X] T030 [P] [US2] Build `ProgressBars` component in `mobile/app/shared/ui/ProgressBars.tsx`,
  sourced from the `progress` primitive (T007) (FR-016; used by Onboarding)
- [X] T031 [US2] Implement the Register screen in `mobile/app/(auth)/register.tsx`: name/email/
  password `Input`s, consent line, "Already have an account? Log in" link, Create Account `Button`
  (FR-022, FR-024, FR-027)
- [X] T032 [US2] Wire Register submit to `explorerRepository.register()` (T015): duplicate-email
  error with field preservation, success → `sessionStore` signed-in + navigate to Onboarding
  (FR-020, FR-023; spec US2 acceptance scenarios 1–2)
- [X] T033 [US2] Implement the Onboarding screen in `mobile/app/(auth)/onboarding.tsx`: 3 full-bleed
  slides, gradient scrim (`expo-linear-gradient`), `ProgressBars` (T030), Skip pill top-right,
  swipe + tap-to-advance (FR-029, FR-030; research.md R10)
- [X] T034 [US2] Wire Onboarding completion (finish last slide or Skip) to
  `sessionStore.onboardingCompletedAt` and navigate to `/main`; ensure it is never shown again once
  completed (spec US2 acceptance scenario 3)
- [X] T035 [US2] Handle the backgrounded-mid-onboarding resume case via the `_layout.tsx` (T017)
  routing guard — relaunch resumes at Onboarding, not a lost/duplicated account (spec US2 acceptance
  scenario 4)
- [X] T036 [US2] Implement the blank main placeholder screen in `mobile/app/main.tsx`: themed,
  minimal content confirming the flow completed (FR-031, FR-032)
- [X] T037 [P] [US2] Gate Onboarding's slide transitions and any pulsing brand-dot animation on
  `useReducedMotion()` — instant equivalents when reduced motion is enabled (FR-036, scoped to this
  screen; full cross-screen audit is T066)
- [X] T038 [P] [US2] Unit test the Register screen in `mobile/__tests__/screens/register.test.tsx`
  (validation, duplicate-email error, consent gating, field preservation)
- [X] T039 [P] [US2] Unit test the Onboarding screen in
  `mobile/__tests__/screens/onboarding.test.tsx` (3 slides, Skip, swipe/tap advance, no-repeat)
- [X] T040 [P] [US2] Unit test the main placeholder screen in
  `mobile/__tests__/screens/main.test.tsx` (themed render)
- [X] T041 [P] [US2] Unit test `explorerRepository.register()`/duplicate-check in
  `mobile/__tests__/mock/explorerRepository.test.ts`

**Checkpoint**: US1 + US2 independently testable together — fresh install → language → register →
onboarding → blank main placeholder, with zero backend calls.

---

## Phase 5: User Story 3 - Returning Explorer signs back in with mock data (Priority: P2)

**Goal**: Someone with an existing mock account signs back in and lands directly on the blank main
placeholder screen, skipping Onboarding.

**Independent Test**: With an existing mock/local account (from US2), open the sign-in screen,
submit valid credentials, and land directly on the blank main placeholder screen.

### Implementation for User Story 3

- [X] T042 [US3] Implement the Log in screen in `mobile/app/(auth)/login.tsx`: email/password
  `Input`s, "Quên mật khẩu?" link (visible, non-functional per FR-028), `SocialAuthButton` row,
  "New to VieGo? Create account" link to `/register` (FR-021, FR-024, FR-026, FR-028)
- [X] T043 [US3] Wire Log in submit to `explorerRepository.login()` (T015): credential check, clear
  error banner on failure with the entered email preserved (FR-023; spec US3 acceptance scenarios
  1–2)
- [X] T044 [US3] Wire successful login to `sessionStore` (signed-in) and navigate straight to
  `/main`, skipping Onboarding (spec US3 acceptance scenario 1)
- [X] T045 [US3] Implement session-restore-on-relaunch in the `_layout.tsx` (T017) routing guard: a
  still-valid signed-in + onboarding-complete session skips straight to `/main` (FR-033)
- [X] T046 [US3] Apply `SocialAuthButton`'s `disabled` state (T023) to the not-yet-wired providers
  (Facebook, Zalo) on the Log in screen, clearly communicating unavailability (spec US3 acceptance
  scenario 4)
- [X] T047 [P] [US3] Unit test the Log in screen in `mobile/__tests__/screens/login.test.tsx` (valid
  login, invalid credentials + email preservation, nav to Register, disabled-provider state)
- [X] T048 [P] [US3] Extend `mobile/__tests__/mock/explorerRepository.test.ts` (T041) with
  `login()` cases (valid, invalid email, invalid password)
- [X] T049 [P] [US3] Unit test the relaunch session-restore/skip-to-main routing guard behavior in
  `mobile/__tests__/app/_layout.test.tsx`

**Checkpoint**: US1 + US2 + US3 independently testable — both the new-Explorer and
returning-Explorer paths work end-to-end against mock data.

---

## Phase 6: User Story 4 - Every screen is consistent, legible, and accessible (Priority: P3)

**Goal**: The full component base foundation is complete (including components not yet wired into
any screen this feature), and every screen built above is verified consistent across theme,
language, motion, and assistive-technology settings.

**Independent Test**: Sweep the language, sign-in, register, onboarding, and placeholder main
screens in both themes, both shipped languages, with reduced motion on, and with a screen reader.

### Implementation for User Story 4

- [X] T050 [P] [US4] Build `Card` component in `mobile/app/shared/ui/Card.tsx` (FR-012; unwired
  this feature — first consumer: Profile & Preferences)
- [X] T051 [P] [US4] Build `Chip` component in `mobile/app/shared/ui/Chip.tsx`, sourced from the
  `toggle`/`toggle-group` primitives (T007)
- [X] T052 [P] [US4] Build `StreakBadge` component in `mobile/app/shared/ui/StreakBadge.tsx`
- [X] T053 [P] [US4] Build `Avatar` component in `mobile/app/shared/ui/Avatar.tsx`, sourced from
  the `avatar` primitive (T007) (FR-015)
- [X] T054 [P] [US4] Build `Toggle` component in `mobile/app/shared/ui/Toggle.tsx`, sourced from
  the `switch` primitive (T007) (FR-013)
- [X] T055 [P] [US4] Build `ListRow` (+ `SpotRow` variant) component in
  `mobile/app/shared/ui/ListRow.tsx` (FR-014)
- [X] T056 [P] [US4] Build `StatTile` component in `mobile/app/shared/ui/StatTile.tsx` (FR-014)
- [X] T057 [P] [US4] Build `Confetti` component in `mobile/app/shared/ui/Confetti.tsx` (renders
  nothing under reduced motion)
- [X] T058 [P] [US4] Build `BottomTabBar` component in
  `mobile/app/shared/ui/navigation/BottomTabBar.tsx` (`expo-blur`; unwired this feature)
- [X] T059 [P] [US4] Build `ScreenHeader` + `BackButton` components in
  `mobile/app/shared/ui/navigation/ScreenHeader.tsx`, `mobile/app/shared/ui/navigation/BackButton.tsx`
- [X] T060 [US4] Build `BottomSheet` component in
  `mobile/app/shared/ui/navigation/BottomSheet.tsx` — Reanimated + Gesture Handler gesture-driven
  sheet, no `@rn-primitives` equivalent exists (research.md R1)
- [X] T061 [P] [US4] Build `SegmentedControl` component in
  `mobile/app/shared/ui/navigation/SegmentedControl.tsx`, sourced from the `tabs` primitive (T007)
- [X] T062 [P] [US4] Unit tests for T050–T061 in `mobile/__tests__/ui/*.test.tsx` (render/behave
  per [contracts/component-contracts.md](contracts/component-contracts.md) even with no live screen
  consumer)
- [X] T063 [US4] Light/dark theme visual QA sweep across all 5 screens (language, login, register,
  onboarding, main) — no unreadable/missing/mis-colored content (FR-007, SC-003)
- [X] T064 [US4] VI/EN string-fit audit across all 5 screens — no truncated/overlapping text
  (FR-034, SC-004)
- [X] T065 [US4] Touch-target size audit across every interactive control on all 5 screens — ≥44×44
  (FR-017, SC-005)
- [X] T066 [US4] Screen-reader accessibility audit across all 5 screens — every interactive control
  has a meaningful spoken name/state (FR-035, SC-007)
- [X] T067 [US4] Reduced-motion audit across every animated element on all 5 screens (brand gold-dot
  pulse, screen-enter transitions, Onboarding) — instant equivalents when enabled (FR-036)

**Checkpoint**: All four user stories independently functional; the full component base and
cross-cutting quality bar are verified.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end verification spanning all four stories.

- [X] T068 [P] Maestro E2E flow: new-Explorer first-launch journey in
  `mobile/.maestro/first-launch.yaml` (language → register → onboarding → main)
- [X] T069 [P] Maestro E2E flow: returning-Explorer sign-in journey in
  `mobile/.maestro/returning-signin.yaml` (login → main, Onboarding skipped)
- [ ] T070 Run [quickstart.md](quickstart.md)'s manual smoke test end-to-end via Expo Go on iOS and
  Android
- [ ] T071 [P] Non-technical-participant review of validation/sign-in error messages against SC-008
  (≥90% understand what to do next)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — **BLOCKS all user stories**.
- **User Story 1 (Phase 3)**: Depends on Foundational only.
- **User Story 2 (Phase 4)**: Depends on Foundational only — independent of US1's implementation,
  though in practice it's reached by continuing through US1's screen.
- **User Story 3 (Phase 5)**: Depends on Foundational **and** on US2 (T031 Register screen, T032
  `explorerRepository.register()`) existing, since signing back in requires an account created by
  the registration path — matches the priority ordering in spec.md ("Depends on Story 2 existing").
- **User Story 4 (Phase 6)**: Depends on Foundational; its screen-sweep tasks (T063–T067) also
  depend on US1–US3's screens existing to sweep them, so run this phase last even though most of
  its component-build tasks (T050–T062) have no such dependency and could start earlier.
- **Polish (Phase 7)**: Depends on all four user stories being complete.

### Within Each User Story

- Components before the screens that consume them.
- Screen structure before wiring to stores/mock repository.
- Story implementation before that story's unit tests are meaningful (though tests may be written
  alongside, per `mobile/CLAUDE.md`).

### Parallel Opportunities

- All Setup tasks marked [P] (T002–T007) can run in parallel once T001 completes.
- Foundational store/mock-repo tasks (T010–T012, T015) and the shared-component tasks (T019–T023)
  are all [P] — different files, no cross-dependencies.
- Once Foundational (Phase 2) completes, **US1 and US2 can be worked in parallel** (different
  screens, no shared files beyond what Foundational already created). **US3 must wait for US2's
  T031/T032.** US4's component-build tasks (T050–T061) can start as soon as Foundational completes,
  in parallel with US1–US3; only its screen-sweep tasks (T063–T067) must wait for those screens.

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch independent store/mock-repo creation together:
Task: "Create mobile/app/shared/store/themeStore.ts"
Task: "Create mobile/app/shared/store/languageStore.ts"
Task: "Create mobile/app/shared/store/sessionStore.ts"
Task: "Create mobile/app/shared/mock/explorerRepository.ts"

# Launch independent shared-component builds together:
Task: "Build Button in mobile/app/shared/ui/Button.tsx"
Task: "Build Input in mobile/app/shared/ui/Input.tsx"
Task: "Build Divider in mobile/app/shared/ui/Divider.tsx"
Task: "Build IconButton in mobile/app/shared/ui/IconButton.tsx"
Task: "Build SocialAuthButton in mobile/app/shared/ui/SocialAuthButton.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories).
3. Complete Phase 3: User Story 1.
4. **STOP and VALIDATE**: fresh install shows a working, persisted, themed Language Select screen.

### Incremental Delivery

1. Setup + Foundational → theme, component primitives, routing skeleton, mock-data layer ready.
2. Add US1 → Language Select works standalone → validate.
3. Add US2 → a brand-new person can get from language pick to the blank main placeholder with a
   mock account → validate (this is the first fully end-to-end demoable path).
4. Add US3 → a returning person can sign back in → validate.
5. Add US4 → full component base complete; theme/language/motion/a11y consistency verified across
   every screen → validate.
6. Polish (Phase 7) → E2E flows + full manual smoke test.

### Parallel Team Strategy

With multiple developers, after Foundational completes:

- Developer A: User Story 1 (Language Select), then joins US4's component-build tasks.
- Developer B: User Story 2 (Register + Onboarding + main placeholder).
- Developer C: starts on US4's independent component-build tasks (T050–T062) immediately, then
  picks up User Story 3 once Developer B's T031/T032 land.

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps each task to its user story for traceability.
- Commit after each task or logical group.
- Every screen/component task should land with its unit-coverage task in the same change per
  `mobile/CLAUDE.md`'s testing convention, not as a deferred follow-up.
- Verify tests fail (or the behavior is visibly absent) before implementing, then pass after.
- Stop at any checkpoint to validate a story independently before continuing.
