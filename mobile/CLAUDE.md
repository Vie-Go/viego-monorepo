# Mobile (Expo) — Development Rules

Scope: everything under `mobile/`. This extends the root [CLAUDE.md](../CLAUDE.md); when the two
conflict for mobile work, this file wins. For product/architecture context read
[plan.md](../specs/001-phase-0-walking-skeleton/plan.md) first — this is currently **Phase 0
walking skeleton**, so don't let UI-library work grow into an unscoped redesign.

## Stack (current)

Expo SDK 57 (managed workflow, no committed `ios/`/`android/`), React Native 0.86, React 19,
TypeScript. No native folders are checked in — native config lives in `app.json` / config plugins,
not hand-edited Xcode/Gradle files.

**Stack direction (confirmed, supersedes older docs):**
- **Navigation**: **Expo Router** (file-based routing under `app/`), not React Navigation directly
  (Expo Router is built on it, but routes/screens are defined by file structure, not manual
  navigator trees). The code currently in [`app/navigation/RootNavigator.tsx`](app/navigation/RootNavigator.tsx)
  using `@react-navigation/*` directly is the pre-migration state, not the target pattern — don't
  extend it with more manual navigators; new/changed screens should move toward `app/<route>.tsx`
  file-based routes.
- **Client/UI state**: **Zustand**. Use it for local/client state (theme toggle, auth session flags,
  form/UI state) — small stores, no boilerplate reducers.
- **Server state**: **TanStack Query** (already in use) for anything fetched from the backend
  (health/ping today, real API data later). Don't duplicate server data into a Zustand store — Query
  owns caching/invalidation for server data, Zustand owns everything else.
- **Unit/component tests**: **Jest + React Native Testing Library**, colocated under `__tests__/` (or
  `*.test.tsx` next to the file) — test behavior via RNTL queries, not implementation details/snapshots
  of internal component trees.
- **E2E**: **Maestro** (YAML flow files) for full-app flows across screens, not Detox. Keep Maestro
  flows under a `mobile/.maestro/` (or `mobile/e2e/`) directory; these run against a built app/dev
  client, not against unit-test mocks.

> This is now recorded as [ADR-0011](../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0011-expo-router-zustand-maestro-for-mobile.md)
> (refines [ADR-0008](../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0008-expo-and-eas-toolchain.md)),
> and [plan.md](../specs/001-phase-0-walking-skeleton/plan.md) / [research.md](../specs/001-phase-0-walking-skeleton/research.md)
> / [frontend-architecture.md](../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/frontend-architecture.md)
> / [test-strategy.md](../docs/02-process-documentation/test-strategy.md) / [ci-cd.md](../docs/01-product-documentation/04-user-documentation/system-admin-documentation/ci-cd.md)
> have been updated to match. What's still open: `mobile/app/navigation/RootNavigator.tsx` and the
> `app/shared/ui/` primitives predate the ADR and haven't been migrated yet (tracked as follow-up
> work, see tasks.md's Notes section) — expect to find the pre-migration code when you open those
> files, not the target pattern.

## UI: use `@expo/ui`, not raw React Native primitives

- Default to **`@expo/ui`** universal components (`Host`, `Column`, `Row`, `Button`, `Text`, `List`,
  `Switch`, `Slider`, `Menu`, `DateTimePicker`, `BottomSheet`, etc., imported from `@expo/ui`) for
  new screens and components. These render real SwiftUI on iOS and Jetpack Compose on Android —
  prefer them over hand-rolled `View`/`TouchableOpacity`/`StyleSheet` primitives like the current
  [`app/shared/ui/index.tsx`](app/shared/ui/index.tsx) `Button`/`Card`/`Input`.
- Only drop to the platform-specific trees (`@expo/ui/swift-ui`, `@expo/ui/jetpack-compose`) for an
  affordance that's genuinely platform-only. Don't split a universal screen into two platform files
  just for minor visual tweaks.
- Existing custom primitives in `app/shared/ui/` are migration candidates, not a pattern to keep
  extending — when you touch a screen that uses them, prefer replacing with `@expo/ui` equivalents
  wired to the existing theme tokens in `app/shared/theme/tokens.ts`, rather than adding new custom
  primitives.
- **Before writing any `@expo/ui` tree**, load the `expo:expo-ui` skill (`Skill({skill:
  "expo:expo-ui"})`). Don't guess component props from memory — the API surface (modifiers, Host
  sizing, event props) is easy to get subtly wrong.
- For HIG-level styling questions (semantic colors, SF Symbols, native controls not covered by
  `@expo/ui`), load `expo:expo-native-ui`.

## Config plugins & native installs

- Install any native-capable package with `npx expo install <package>` (not raw `npm`/`yarn add`) so
  the version matches this Expo SDK.
- If a package ships a config plugin, register it in `app.json`'s `"plugins"` array — don't hand-edit
  native project files (there are none checked in; this app is managed workflow).
- Adding a package with native code means **Expo Go can no longer run this app** — it needs a
  development build (`expo-dev-client`). Call this out explicitly when it happens instead of letting
  `expo start` silently fail for the user.
- Prefer `mcp__expo__add_library` over a bare `Bash npm install` when installing/linking an
  Expo-aware library — it resolves SDK-compatible versions and flags config-plugin requirements.

## Skills — load before, not instead of, reading code

- `expo:expo-ui` — any `@expo/ui` component tree.
- `expo:expo-native-ui` — HIG styling, semantic colors, native controls/animations outside `@expo/ui`.
- `expo:expo-router` — load for **any** routing/navigation work. Expo Router is the target
  navigation stack (see Stack direction above); use it for new routes and when migrating existing
  screens off manual `@react-navigation/*` trees.
- `expo:expo-examples` — check for a canonical `with-*` integration pattern before hand-rolling a
  third-party integration (Stripe, maps, SQLite, etc.).
- `expo:expo-upgrade` — any SDK version bump or dependency-conflict-after-upgrade task.
- `expo:eas-app-stores` / `expo:eas-hosting` / `expo:eas-workflows` / `expo:eas-update-insights` /
  `expo:eas-simulator` — anything involving EAS Build/Submit/Update/Hosting/CI. Don't hand-write
  `eas.json`, workflow YAML, or `eas` CLI invocations from memory; these are paid services with
  exact current syntax that drifts from training data.
- `expo:expo-dev-client` — building/distributing a dev client for internal testing (separate from
  production TestFlight/store submission, which is `eas-app-stores`).

## MCP (`mcp__expo__*`)

- `read_documentation` — check current Expo API/behavior instead of relying on memory, especially
  for anything SDK-version-specific.
- `add_library` — install/link libraries (see above).
- `build_*` / `workflow_*` — inspect or trigger EAS builds/workflows instead of shelling out to
  `eas` CLI blind; these tools give structured build/workflow state.
- `learn` — general SDK/API guidance lookups.
- Store-review and crash tools (`testflight_*`, `playstore_*`, `appstore_*`) are for triaging live
  app feedback/crashes — treat replying to a public review as a **send-message-on-user's-behalf**
  action requiring explicit confirmation, same as any other public post.

## Testing

- **Unit/component**: Jest + RNTL. Query by role/text/label like a user would, not by
  implementation (`testID` only when no accessible query works). Run via the existing `mobile`
  package scripts; add a `test` script if one doesn't exist yet rather than inventing an ad hoc
  runner invocation.
- **E2E (Maestro)**: write flows for cross-screen journeys (auth → tab navigation → core actions),
  not for things unit tests already cover. Maestro drives a real build (dev client or release), so
  it can't validate logic Jest already validates faster — don't duplicate coverage between the two.
- New screens/components should land with unit coverage in the same change; E2E flows get added
  when a journey spans multiple screens end-to-end, not per-component.

## Constitution reminders specific to mobile

- No new domain terms without a glossary check (root constitution principle II).
- A stack-level decision (routing library, state management, UI kit swap) is an **ADR**, not a
  drive-by refactor — see [ADR-0008](../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0008-expo-and-eas-toolchain.md) as the precedent for the Expo/EAS toolchain decision itself.
