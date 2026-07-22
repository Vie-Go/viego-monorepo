---
title: "ADR 0003 — React Native for cross-platform mobile"
description: "Use React Native + TypeScript to ship iOS and Android from one codebase."
---

# ADR 0003 — React Native for cross-platform mobile

- **Status:** Accepted · **Date:** 2026-07-22 · **Deciders:** Vie-Go team

## Context
Vibeat must ship to **both iOS and Android** with a small team, a highly custom UI (interactive
SVG map, animations, theming), and fast iteration. The prototype is web/JS.

## Decision
Use **React Native (TypeScript)** targeting iOS and Android from a single codebase. Design tokens
come from the [design system](../../ux-design-documentation/design-system.md); the prototype's
`<vn-map>` is ported to an RN SVG component.

Open sub-decision (own ADR when decided): **Expo vs. bare React Native**.

## Consequences
- **+** One codebase for both platforms; TS reuse from the prototype; large ecosystem.
- **+** Fast iteration suits a gamified, content-driven app.
- **−** Native modules may be needed; performance-critical map rendering needs care; RN upgrades.

## Alternatives
- **Flutter** — diverges from the JS/TS prototype and team skills.
- **Native iOS + Android separately** — rejected: double the build/maintenance cost.
