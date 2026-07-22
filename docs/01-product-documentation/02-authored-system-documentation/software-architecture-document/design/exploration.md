---
title: "Design — Exploration module (Province unlocking)"
description: "Detailed design of the exploration module: map, provinces/wards, the Collection aggregate, unlocking, and the ProvinceUnlocked event."
---

# Design — Exploration module (Province unlocking)

- **Module:** `exploration` · **Core feature:** Province unlocking ·
  **Phase:** [P2 — Core loop: Exploration](../../../../02-process-documentation/plans-estimates-schedules.md)
- **Spec:** [`province-unlocking.feature`](../../../01-core-specifications/executable-specifications/features/exploration/province-unlocking.feature)
- **Requirements:** [FR-EX-01…07](../../../01-core-specifications/requirements/functional-requirements.md#fr-ex--exploration-province-unlocking) · constrained by [NFR-PERF-01](../../../01-core-specifications/requirements/non-functional-requirements.md#nfr-perf--performance), [NFR-REL-03](../../../01-core-specifications/requirements/non-functional-requirements.md#nfr-rel--reliability--data-integrity)
- **The heart of the product.** Its **`ProvinceUnlocked`** event is the
  [backbone](../../../../02-process-documentation/plans-estimates-schedules.md)
  that Engagement (P3) and Content (P4) both hang off — so this event contract must be right
  before those phases begin.

## Purpose & scope

Render the interactive map of Vietnam, let an Explorer **unlock** a **Province** they have
discovered, and grow their **Collection**. Unlocking is idempotent (never twice) and emits
`ProvinceUnlocked` for downstream contexts.

The **unlock condition** itself (proximity / trivia / tap / purchase) is an **open product
decision** (see *Open decisions* below) — the design keeps it behind a strategy seam so the rest
of the flow is stable regardless of which condition wins.

## Domain model

- **Collection** *(aggregate root, per Explorer)* — the set of unlocked Provinces.
  - *Invariant:* a Province appears **at most once**; it is added **only** via a valid `Unlock`.
- **Province** *(entity)* — `id: ProvinceId`, `name: LocalizedText`, `geometry`, `wards: Ward[]`,
  `unlocked`.
- **Ward** *(entity)* — a sub-division of a Province with its own metadata.
- **UnlockCondition** *(strategy, pending)* — evaluates whether an unlock is permitted; pluggable
  so the choice can change without touching the aggregate or API.

## Commands & events

| Direction | Name | Trigger / effect |
|-----------|------|------------------|
| Command | `UnlockProvince(explorerId, provinceId)` | Check condition + idempotency; add to Collection; emit `ProvinceUnlocked`. |
| **Publishes** | **`ProvinceUnlocked`** | `{ explorerId, provinceId, at }` — the backbone event. |
| Consumes | `ExplorerRegistered` (from Identity) | Provision an empty Collection for the new Explorer. |

## REST API

| Method & path | Purpose | Notes |
|---------------|---------|-------|
| `GET /api/v1/provinces` | List provinces + geometry for the map | `LocalizedText` per `Accept-Language` |
| `POST /api/v1/provinces/{id}/unlock` | Unlock a province | **Idempotent**; 409 `"Province already unlocked"`; 4xx if condition unmet |
| `GET /api/v1/collection/me` | The Explorer's unlocked provinces | Drives CollectionTab + map fill |

Idempotency: a second unlock of the same province is rejected with Problem Details
`"Province already unlocked"` and leaves the collection **unchanged** (spec scenario).

## Persistence

- Schema **`exploration`** (owned).
- Canonical province/ward datasets (the prototype's data) are **ingested** into this schema at P2.
- Tables: `province`, `ward`, `collection_entry (explorer_id, province_id, unlocked_at)`.
- No FK to `identity` — `explorer_id` is a value; the empty Collection is created from the
  `ExplorerRegistered` listener.
- Flyway: `db/migration/exploration/V1__init.sql` (+ seed migration for canonical data).

## Backend flow — unlock a province

```
POST /api/v1/provinces/HANOI/unlock
  → exploration.infrastructure.web.ProvinceController
  → exploration.application.UnlockProvinceService (tx)
      → UnlockCondition.evaluate(...)          → refuse (4xx) if unmet
      → Collection.unlock(provinceId)          → invariant: reject if already present (409)
      → publish ProvinceUnlocked               (event log, same tx)
  ⇢ engagement listener advances Streak        (async, separate tx)
  ⇢ content listener grants heritage access    (async, separate tx)
```

## Mobile design ([feature `exploration`](../frontend-architecture.md))

- **Map:** the prototype's `<vn-map>` ported to a **React Native SVG** component; provinces fill
  **gold** when unlocked. Map-render performance on low-end devices is a tracked
  [risk](../../../../02-process-documentation/plans-estimates-schedules.md) —
  profile early, simplify/virtualize SVG.
- **Navigation:** `MapTab` (map + province detail + unlock flow) and `CollectionTab` (unlocked
  provinces); deep link `vibeat://province/{id}`.
- **Unlock flow:** province detail → unlock action → **celebratory animation** (reduced-motion
  aware) → map fill + collection update.
- **State:** React Query `['exploration','collection']` and `['exploration','provinces']`; the
  unlock **mutation invalidates** collection + map + streak so all three refresh together.
- **Offline (proposed):** cache the collection; queue an unlock and reconcile on reconnect,
  leaning on the endpoint's idempotency.

## Open decisions

- **Unlock condition** (proximity / trivia / tap / purchase) — Owner: Product · **needed by P2**.
  Isolated behind `UnlockCondition`; the `@draft` scenario *"Unlock condition must be met"* stays
  explicit until resolved.
