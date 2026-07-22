---
title: "ADR 0001 — Record architecture decisions with ADRs"
description: "We record significant technical decisions as immutable, numbered ADRs."
---

# ADR 0001 — Record architecture decisions with ADRs

- **Status:** Accepted · **Date:** 2026-07-22 · **Deciders:** VieGo team

## Context
VieGo follows Spec-Driven Development. Behavioural decisions live in
[Core Specifications](../../../01-core-specifications/), but we also make **technical** decisions
(frameworks, data ownership, integration) that need durable, reviewable rationale.

## Decision
Record significant technical decisions as ADRs in this folder, one Markdown file per decision,
numbered sequentially. ADRs are immutable; change a decision by adding a superseding ADR.

## Consequences
- **+** Durable rationale; easy onboarding; agents can read decision history.
- **+** Clear separation — specs = behaviour, ADRs = architecture.
- **−** Small authoring overhead per decision.

## Template
Copy this structure: Context → Decision → Consequences.
