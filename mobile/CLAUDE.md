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

## UI: NativeWind + React Native Reusables, not `@expo/ui`

> **Superseded default (2026-07-23):** this section previously defaulted new components to
> `@expo/ui`. That's now the exception, not the rule — see
> [ADR-0012](../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0012-nativewind-and-react-native-reusables-for-mobile-ui.md).
> `@expo/ui` renders real native SwiftUI/Jetpack Compose controls, which cannot reproduce the
> [design system](../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/design-system.md)'s
> one custom, cross-platform-identical brand skin (ported 1:1 from
> [`prototype/VieGo.dc.html`](../prototype/VieGo.dc.html)) — that requirement and the `@expo/ui`
> default are mutually exclusive, so the default changed.

- Default to **NativeWind v4** (Tailwind-style utility classes compiled onto plain `View`/
  `Pressable`/`Text`, themed from a VieGo-specific Tailwind config that encodes the design system's
  tokens — palette, radius, spacing, font, shadow — once) for styling every new screen/component.
- Start new interactive components from **React Native Reusables (RNR)**'s copy-paste source —
  accessible, unstyled `@rn-primitives/*` packages (`switch`, `radio-group`, `select`, `toggle`,
  `dialog`, `progress`, `avatar`, `checkbox`, `accordion`, `tabs`, `tooltip`, `toast`, `separator`,
  `slider`, and more) — then restyle to the VieGo Tailwind theme. Components with no
  `@rn-primitives` equivalent (the branded `Button`, `StreakBadge`, gesture-driven `BottomSheet`,
  etc.) are hand-built directly on NativeWind-styled RN views. Components are copied into
  [`app/shared/ui/`](app/shared/ui/) (same location/convention as before) — owned in this repo, not
  an opaque dependency.
- See [contracts/component-contracts.md](../specs/002-theme-components-identity/contracts/component-contracts.md)
  for the full prototype-component-to-`@rn-primitives` mapping, and
  [research.md](../specs/002-theme-components-identity/research.md) R1 for the verified version
  compatibility (React/RN/Expo/NativeWind/Reanimated versions checked against RNR's own showcase
  app, not assumed).
- **`@expo/ui` is now the exception**, reserved for a genuinely platform-only affordance with no
  design-system equivalent (a native share sheet, a system permission prompt) — not a starting
  point. Only drop to its platform-specific trees (`@expo/ui/swift-ui`, `@expo/ui/jetpack-compose`)
  for that kind of affordance, and don't split a design-system screen into two platform files for
  it. When you do use `@expo/ui` for one of these exceptions, load the `expo:expo-ui` skill first
  (`Skill({skill: "expo:expo-ui"})`) — don't guess component props from memory.
- **Before NativeWind/RNR setup or config work**, load the `expo:expo-tailwind-setup` skill
  (`Skill({skill: "expo:expo-tailwind-setup"})`) rather than hand-writing `tailwind.config.js`/
  babel/metro wiring from memory — verify the current NativeWind major version at that time (this
  skill mentions "NativeWind v5"/`react-native-css`, while the latest published `nativewind` on npm
  was `4.2.6` when ADR-0012 was written; reconcile before committing to a version).
- For HIG-level styling questions on the `@expo/ui` exception path (semantic colors, SF Symbols,
  native controls), load `expo:expo-native-ui`.

## Config plugins & native installs

- Install any native-capable package with `npx expo install <package>` (not raw `npm`/`yarn add`) so
  the version matches this Expo SDK.
- If a package ships a config plugin, register it in `app.json`'s `"plugins"` array — don't hand-edit
  native project files (there are none checked in; this app is managed workflow).
- A package with native code **might** end Expo Go support and need a development build
  (`expo-dev-client`) — but not always: Expo curates a large set of common native-code packages that
  Expo Go itself bundles (e.g. `react-native-reanimated`, `react-native-gesture-handler`,
  `react-native-svg`, `expo-blur`, `expo-linear-gradient`, `@react-native-async-storage/async-storage`
  are all "Included in Expo Go" per the current SDK reference — verified for
  [ADR-0012](../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0012-nativewind-and-react-native-reusables-for-mobile-ui.md)'s
  dependency set, none of them required a dev-client). **Check the package's page under
  `docs.expo.dev/versions/latest/sdk/...md` (via `mcp__expo__read_documentation`) for the
  "Included in Expo Go" line before assuming either way**, and call out the actual result
  explicitly instead of guessing or letting `expo start` silently fail for the user.
- Prefer `mcp__expo__add_library` over a bare `Bash npm install` when installing/linking an
  Expo-aware library — it resolves SDK-compatible versions and flags config-plugin requirements.

## Skills — load before, not instead of, reading code

- `expo:expo-tailwind-setup` — any NativeWind/Tailwind config work (the default styling approach —
  see UI section above). Verify the NativeWind major version current at the time against what this
  skill and the npm registry actually say; don't assume the version named in ADR-0012.
- `expo:expo-ui` — only for the `@expo/ui` exception path (a platform-only affordance with no
  design-system equivalent), not the default component path.
- `expo:expo-native-ui` — HIG styling, semantic colors, native controls/animations outside `@expo/ui`,
  also only relevant to the exception path.
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
  drive-by refactor — see [ADR-0008](../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0008-expo-and-eas-toolchain.md) (Expo/EAS toolchain) and
  [ADR-0012](../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0012-nativewind-and-react-native-reusables-for-mobile-ui.md)
  (NativeWind + React Native Reusables, superseding the never-formally-recorded `@expo/ui` default)
  as precedents.
