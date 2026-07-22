---
title: "ADR 0006 — Single monorepo for backend and mobile"
description: "Keep the Spring Boot backend and React Native app in one Git repository with path-scoped CI."
---

# ADR 0006 — Single monorepo for backend and mobile

- **Status:** Accepted · **Date:** 2026-07-22 · **Deciders:** Vie-Go team

## Context
Vibeat is built by two full-stack engineers working **contract-first** and **trunk-based**
(see [Plans, Estimates, Schedules](../../../../../02-process-documentation/plans-estimates-schedules.md)).
The system is two deployable units — the Spring Boot (Java 25) modular monolith and the React
Native app — that share the [OpenAPI](../../../01-core-specifications/api-system-specifications/rest-api.openapi.yaml)
and [AsyncAPI](../../../01-core-specifications/api-system-specifications/domain-events.asyncapi.yaml)
contracts as their single source of truth. With **vertical ownership** (one engineer owns a
feature backend-through-mobile per phase), a contract change and both sides that depend on it
naturally land in the **same change set**.

Splitting these into two repositories would fragment that atomic change, force cross-repo PR
choreography for every contract edit, and duplicate tooling and CI configuration for a
two-person team.

## Decision
Keep **one Git repository** (a monorepo) containing both applications and the shared contracts:

```
/                     # repo root — shared tooling, root CI workflows, docs
├── backend/          # Spring Boot (Java 25) modular monolith — Maven
├── mobile/           # React Native + TypeScript app
├── contracts/        # OpenAPI + AsyncAPI (source of truth for both sides)
└── docs/             # this documentation site
```

- **Trunk-based**, one default branch; a single PR can carry a contract change plus both sides.
- **Path-scoped CI:** each pipeline is triggered only by changes under its own path (plus the
  shared `contracts/`). A **frontend-only change does not trigger the backend build**, and vice
  versa — see [CI/CD](../../../04-user-documentation/system-admin-documentation/ci-cd.md).
- Each app keeps its **own build** (`backend/` via Maven, `mobile/` via npm/EAS) and its **own
  release cadence and deployable artifact** — monorepo is about co-location, not a single
  lockstep deploy.
- Generated artifacts (TS client, Redoc/AsyncAPI, Modulith diagrams) are produced from
  `contracts/` and consumed in-repo, removing a cross-repo publish step.

## Consequences
- **+** Atomic contract changes: a breaking API edit and both consumers land in one reviewable PR.
- **+** Single tooling/CI surface; no cross-repo version pinning for a two-person team.
- **+** Fits vertical ownership — a feature's whole slice lives in one place.
- **−** Path filters must be correct or CI over-builds (mitigated: builds are path-scoped, below).
- **−** Repo grows two ecosystems (JVM + Node); contributors clone more than they touch (acceptable
  at this size; sparse/partial checkout available later if needed).

## Alternatives
- **Two repos (backend + mobile)** — rejected: every contract change becomes a coordinated
  two-PR dance, and generated clients need a publish/consume hop between repos.
- **Monorepo build tool (Nx / Bazel / Turborepo)** — deferred: native Maven + npm path filters
  are enough at two apps / two people; revisit if the graph grows.

## Related
- [ADR 0002 — Modular monolith](0002-modular-monolith-with-spring-modulith.md) (backend stays one
  deployable; monorepo is orthogonal to service extraction).
- [ADR 0004 — Java 25 + Spring Boot / Maven](0004-java-and-spring-boot.md).
