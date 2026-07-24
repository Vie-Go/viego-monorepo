---
title: "Detailed Design (per module / core feature)"
description: "Low-level design for each bounded-context module and its core feature — domain, events, API, persistence, and mobile UI."
---

# Detailed Design (per module / core feature)

Where the [architecture](../README.md) says *how the system is shaped*, these documents say *how
each module is actually built*. There is **one design document per
[bounded-context module](../ddd-and-domain-model.md)**, and each module's design centres on its
**core feature** — the one behaviour that defines it. Every design is scoped to the delivery
**phase** that builds it in the
[Plans, Estimates, Schedules](../../../../02-process-documentation/plans-estimates-schedules.md).

## Design ↔ module ↔ feature ↔ phase

| Design | Module | Core feature (spec) | Backbone event | Phase |
|--------|--------|---------------------|----------------|-------|
| [Identity](identity.md) | `identity` | [Authentication](../../../01-core-specifications/executable-specifications/features/identity/authentication.feature) | `ExplorerRegistered` | [P1](../../../../02-process-documentation/plans-estimates-schedules.md) |
| [Exploration](exploration.md) | `exploration` | [Map, places & province unlocking](../../../01-core-specifications/executable-specifications/features/exploration/province-unlocking.feature) | `ProvinceUnlocked` *(from `BeatCaptured`)* | [P2](../../../../02-process-documentation/plans-estimates-schedules.md) |
| [Content](content.md) | `content` | [Beat capture](../../../01-core-specifications/executable-specifications/features/content/beat-capture.feature) | **`BeatCaptured`** *(the backbone)* | [P3](../../../../02-process-documentation/plans-estimates-schedules.md) |
| [Engagement](engagement.md) | `engagement` | [Daily streak](../../../01-core-specifications/executable-specifications/features/engagement/daily-streak.feature) | `StreakAdvanced` / `StreakBroken` / `MilestoneReached` | [P4](../../../../02-process-documentation/plans-estimates-schedules.md) |
| [Social](social.md) | `social` | [Friends, feeds & reactions](../../../01-core-specifications/executable-specifications/features/social/social-feed.feature) | `FriendAdded` / `BeatReacted` | [P5](../../../../02-process-documentation/plans-estimates-schedules.md) |
| [Notification](notification.md) | `notification` | Notifications & delivery | `NotificationRaised` | [P4](../../../../02-process-documentation/plans-estimates-schedules.md) |

> The `shared` module is an open kernel of cross-cutting value objects (ids, `LocalizedText`) — it
> has no core feature and therefore no design doc; it is documented in the
> [domain model](../ddd-and-domain-model.md).
>
> **Notification** is a cross-cutting **delivery sink**, not a product feature owned by one context
> — it consumes events from several modules. It gets a design doc because it is a real module with
> its own schema and boundary, but its "backbone event" is the internal `NotificationRaised` rather
> than a domain milestone.

## How each design document is organised

Every module design follows the same shape, so they read consistently and diff cleanly:

1. **Purpose & scope** — the core feature, its spec, and its delivery phase.
2. **Domain model** — aggregates, entities, value objects, and **invariants**.
3. **Commands & events** — what the module accepts and what it publishes/consumes.
4. **REST API** — the endpoints crossing the [contract](../../../01-core-specifications/api-system-specifications/rest-api.openapi.yaml).
5. **Persistence** — schema, tables, and Flyway ownership (schema-per-module, no cross-FKs).
6. **Backend flow** — the request/event sequence that satisfies the core scenarios.
7. **Mobile design** — screens, components, state, and navigation for the feature.
8. **Open decisions** — the product/eng questions this module is waiting on.

## Ground rules inherited by every design

- **Boundaries:** modules integrate only through [domain events](../backend-modular-monolith.md)
  or another module's `::api` — never internals. `ApplicationModules.verify()` gates the build.
- **Data ownership:** one schema per module; reference peers **by id value**, never by FK/join.
- **Vocabulary:** every name here comes from the [ubiquitous language](../ddd-and-domain-model.md) — no synonyms.
- **Frontend:** feature folders mirror these modules
  ([frontend architecture](../frontend-architecture.md)); no hard-coded colours or strings
  ([design system](../../ui-ux-design-document/design-system.md) ·
  [localization](../../ui-ux-design-document/localization.md)).
