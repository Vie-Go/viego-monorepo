---
title: "ADR 0008 — Expo + EAS for the React Native toolchain"
description: "Build the mobile app with Expo (development builds) and EAS Build, resolving the Phase 0 open decision."
---

# ADR 0008 — Expo + EAS for the React Native toolchain

- **Status:** Accepted · **Date:** 2026-07-22 · **Deciders:** VieGo team
- **Refines:** [ADR 0003](0003-react-native-for-mobile.md) (React Native) — this fixes *how* RN is
  built and does not change that decision.

## Context
[ADR 0003](0003-react-native-for-mobile.md) chose React Native but left the toolchain open. Phase 0
listed "Expo vs. bare React Native" as an unresolved engineering decision
([plans-estimates-schedules](../../../../02-process-documentation/plans-estimates-schedules.md)),
and the [Phase 0 spec](../../../../../specs/001-phase-0-walking-skeleton/spec.md) carried it as a
`NEEDS CLARIFICATION`. It must be settled before the mobile scaffold and mobile CI are built.

## Decision
Use **Expo** with **development builds** (config plugins for any native module) and **EAS Build**
for CI and store binaries.

- Modern Expo dev builds give **full native access without ejecting**, so the map SVG work (P2) and
  secure token storage (P1) are not blocked by a managed runtime.
- **EAS** covers the mobile pipeline's build/E2E/store steps and enables **OTA updates** for JS-only
  fixes where store policy allows ([deployment](../../../04-user-documentation/system-admin-documentation/deployment.md)).
- Matches the "npm/EAS" direction already in the stack table.

## Consequences
- **+** Fastest path for a two-engineer team; least native build/signing toil (serves the ≤30-min
  onboarding target and the two-person bus-factor risk).
- **+** OTA updates and managed store builds via EAS.
- **−** Adds Expo/EAS to the toolchain; store builds need an `EAS_TOKEN` in CI.
- **−** Some native modules need Expo config plugins rather than direct linking.

## Alternatives
- **Bare React Native (no Expo)** — maximum control, but the team owns all iOS/Android build config
  and CI signing; slowest to stand up. Rejected for a small team.
- **Expo strictly managed (no dev builds)** — simplest, but risks a native-module wall later.
  Rejected in favour of dev builds, which keep the escape hatch open at no upfront cost.

See the Phase 0 research note (R1) for the full rationale:
[`specs/001-phase-0-walking-skeleton/research.md`](../../../../../specs/001-phase-0-walking-skeleton/research.md).
