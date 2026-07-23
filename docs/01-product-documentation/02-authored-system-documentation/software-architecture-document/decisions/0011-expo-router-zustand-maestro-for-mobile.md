---
title: "ADR 0011 — Expo Router, Zustand, and Maestro for the mobile app"
description: "File-based navigation via Expo Router, Zustand for client state, and Maestro (not Detox) as the sole mobile E2E tool."
---

# ADR 0011 — Expo Router, Zustand, and Maestro for the mobile app

- **Status:** Accepted · **Date:** 2026-07-23 · **Deciders:** VieGo team
- **Refines:** [ADR 0003](0003-react-native-for-mobile.md) (React Native) and
  [ADR 0008](0008-expo-and-eas-toolchain.md) (Expo + EAS toolchain) — this fixes routing, client
  state, and E2E tooling within that stack; it does not change either decision.

## Context
ADR-0003 chose React Native; ADR-0008 chose Expo + EAS as the toolchain, but left routing, client
state management, and the E2E tool unsettled — the Phase 0 walking skeleton shipped with
`@react-navigation/*` navigators wired by hand ([plan.md](../../../../../specs/001-phase-0-walking-skeleton/plan.md)
Technical Context) and deferred E2E entirely ([research.md](../../../../../specs/001-phase-0-walking-skeleton/research.md)
Testing, "Detox/Maestro E2E deferred past P0"). [test-strategy.md](../../../../02-process-documentation/test-strategy.md)
and [ci-cd.md](../../04-user-documentation/system-admin-documentation/ci-cd.md) both listed E2E as
an open "Detox / Maestro" either-or.

Server state (React Query / TanStack Query) was already settled and used consistently across every
bounded-context design doc (`design/{identity,exploration,content,engagement,social}.md`) — this
ADR reaffirms it, it does not change it.

## Decision
- **Navigation: Expo Router.** File-based routes under `mobile/app/`, replacing hand-wired
  `@react-navigation/*` navigator trees. Since Expo Router is built on React Navigation under the
  hood, existing navigator knowledge transfers; what changes is that routes are defined by file
  structure, not manually assembled `Stack`/`Tab` navigator components.
- **Client/UI state: Zustand.** Settles [frontend-architecture.md](../frontend-architecture.md)'s
  "Zustand/Context" either-or in favour of Zustand for any UI-only state that outgrows component
  state (theme toggle, in-progress capture flow state, etc.). Component state remains preferred when
  it doesn't need to be shared. Server data is never mirrored into a Zustand store — TanStack Query
  owns it.
- **Server state: TanStack Query (React Query).** Reaffirmed, unchanged.
- **Unit/component tests: Jest + React Native Testing Library.** Reaffirmed, unchanged.
- **E2E: Maestro**, not Detox. Settles the "Detox/Maestro" either-or wherever it appears
  (test-strategy.md, ci-cd.md). Maestro flows live under `mobile/.maestro/` (or `mobile/e2e/`) and
  drive full cross-screen journeys against a real build (dev client or release), not against unit
  mocks.

## Consequences
- **+** Expo Router's file-based routing removes a class of manually-wired navigator bugs and keeps
  route structure discoverable from the filesystem — consistent with Expo being the chosen toolchain
  (ADR-0008).
- **+** One clear owner per state category (TanStack Query = server, Zustand = client) removes the
  ambiguity the "Zustand/Context" either-or left open.
- **+** Maestro's YAML flows are simpler to author/maintain for a two-engineer team than Detox's
  native-test-runner setup, and don't require the same per-platform native build wiring.
- **−** The Phase 0 walking skeleton's existing navigation code
  (`mobile/app/navigation/RootNavigator.tsx`) and UI primitives predate this decision and need a
  follow-up migration task — not retrofitted implicitly, tracked as new work in the next planning
  pass.
- **−** [executable-specifications/README.md](../../../01-core-specifications/executable-specifications/README.md)
  currently binds Gherkin execution on mobile to **Cucumber/Detox**; Maestro does not have an
  equivalent first-class Cucumber/Gherkin runner. **Open follow-up, not resolved by this ADR**: decide
  how (or whether) Gherkin-authored mobile scenarios map onto Maestro flows, or whether Cucumber/BDD
  execution on mobile is dropped in favour of Maestro flows authored directly from the Gherkin intent.

## Alternatives
- **Keep React Navigation (manual navigators)** — works, but every new screen requires hand-wiring
  into the navigator tree; Expo Router's file-based convention removes that class of error at zero
  runtime cost since it's built on the same underlying library.
- **Redux / Redux Toolkit for client state** — more boilerplate than this app's UI-state needs
  justify; rejected as over-engineering for a small team (same reasoning ADR-0008 applied to Expo vs.
  bare RN).
- **Detox for E2E** — mature and Cucumber-compatible, but heavier CI/native-build setup; rejected in
  favour of Maestro's lower setup cost, with the Gherkin-binding question left open above rather than
  papered over.

See [`mobile/CLAUDE.md`](../../../../../mobile/CLAUDE.md) for the engineering rules this decision
drives day to day.
