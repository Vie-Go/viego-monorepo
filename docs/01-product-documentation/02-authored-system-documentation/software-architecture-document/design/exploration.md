---
title: "Design — Exploration module (Map, places & province unlocking)"
description: "Detailed design of the exploration module: map, provinces/wards, places (POIs), the Collection aggregate, capture-driven unlocking, and the ProvinceUnlocked event."
---

# Design — Exploration module (Map, places & province unlocking)

- **Module:** `exploration` · **Core feature:** Map, places & province unlocking ·
  **Phase:** [P2 — Exploration](../../../../02-process-documentation/plans-estimates-schedules.md)
- **Spec:** [`province-unlocking.feature`](../../../01-core-specifications/executable-specifications/features/exploration/province-unlocking.feature)
- **Requirements:** [FR-EX-01…09](../../../01-core-specifications/requirements/functional-requirements.md#fr-ex--exploration-map-places--province-unlocking) · constrained by [NFR-PERF-01](../../../01-core-specifications/requirements/non-functional-requirements.md#nfr-perf--performance), [NFR-REL-03](../../../01-core-specifications/requirements/non-functional-requirements.md#nfr-rel--reliability--data-integrity)
- **The place the beats land.** Provinces unlock in response to the backbone **`BeatCaptured`** event
  and re-publish **`ProvinceUnlocked`** for province-milestone surfaces.

## Purpose & scope

Render the interactive map of Vietnam (with public check-in **heat**), let an Explorer browse
**Places** (POIs) and their local context, **search** across provinces/places/dishes, and grow their
**Collection** — where a province **unlocks the first time the Explorer captures a Beat there**.
Unlocking is idempotent (never twice).

The unlock trigger is settled: **first Beat in the province** (previously an open decision). The map
distinguishes unlocked provinces (filled gold) and shades others by public check-in volume.

## Domain model

- **Collection** *(aggregate root, per Explorer)* — the set of unlocked Provinces.
  - *Invariant:* a Province appears **at most once**; it is added **only** via a valid unlock
    (a first `BeatCaptured` in that province).
- **Province** *(entity)* — `id: ProvinceId`, `name: LocalizedText`, `geometry`, `wards: Ward[]`,
  `unlocked`, `publicBeats` (drives heat), `myBeats`.
- **Ward** *(entity)* — a sub-division of a Province with its own metadata.
- **Place** *(entity)* — `id: PlaceId`, `name`, `category` (coffee/food/heritage/nightlife/nature/
  hidden), `provinceId`, `coordinates`, `description: LocalizedText`, `hours`, `cost`, `localTip`,
  `rating`.

## Commands & events

| Direction | Name | Trigger / effect |
|-----------|------|------------------|
| Consumes | **`BeatCaptured`** (Content) | If it's the Explorer's first Beat in that province → add to Collection, emit `ProvinceUnlocked`; else no-op. |
| **Publishes** | **`ProvinceUnlocked`** | `{ explorerId, provinceId, at }`. |
| Consumes | `ExplorerRegistered` (Identity) | Provision an empty Collection for the new Explorer. |

## REST API

| Method & path | Purpose | Notes |
|---------------|---------|-------|
| `GET /api/v1/provinces` | Provinces + geometry + unlocked status + heat | `LocalizedText` per `Accept-Language` |
| `GET /api/v1/provinces/{id}` | A province with its places and public beats | Drives the province sheet |
| `GET /api/v1/collection/me` | The Explorer's unlocked provinces | "N / 34 provinces unlocked" + map fill |
| `GET /api/v1/places/{id}` | A place with local context, community beats, reviews | POI detail |
| `GET /api/v1/search` | Search provinces/places/dishes, filter by category | Drives search + category chips |

Unlocking has **no direct endpoint** — it is a side effect of capturing a Beat. Idempotency: a
second Beat in an already-unlocked province leaves the collection unchanged and emits no second
`ProvinceUnlocked`.

## Persistence

- Schema **`exploration`** (owned).
- Canonical province/ward/place datasets (the prototype's data) are **ingested** into this schema.
- Tables: `province`, `ward`, `place`, `collection_entry (explorer_id, province_id, unlocked_at)`.
- No FK to `identity`/`content` — ids are values; the empty Collection is created from the
  `ExplorerRegistered` listener; unlock is driven by the `BeatCaptured` listener.
- Flyway: `db/migration/exploration/V1__init.sql` (+ seed migration for canonical data).
- **Cache** (Redis namespace `exploration:*`, [ADR 0007](../decisions/0007-redis-cache-and-token-rotation.md)):
  province/ward/place lists + geometry change rarely — ideal cache-aside (long TTL). Per-Explorer
  collection + heat are evicted event-driven when the `BeatCaptured` listener unlocks/updates.

## Backend flow — unlock via capture

```
BeatCaptured(explorerId, provinceId, …)          (async, from Content)
  → exploration.infrastructure.listener.BeatCapturedListener
  → exploration.application.UnlockProvinceService (tx)
      → first Beat in provinceId for explorer? no → no-op (idempotent)
                                              → yes → Collection.unlock(provinceId)
      → publish ProvinceUnlocked               (event log, same tx)
  ⇢ engagement listener surfaces province milestones (async)
```

## Mobile design ([feature `exploration`](../frontend-architecture.md))

- **Map:** the prototype's `<vn-map>` ported to a **React Native SVG** component; unlocked provinces
  fill **gold**, others shade by heat; a live-location ping shows inside Vietnam only. Map-render
  performance on low-end devices is a tracked [risk](../../../../02-process-documentation/plans-estimates-schedules.md).
- **Province sheet:** tap a province → bottom sheet with your beats there, spots, and a scrollable
  public-beats album.
- **Place detail:** hero, "why it matters", hours/cost/local tip, community beats, traveller reviews,
  and a **Capture here** CTA.
- **Navigation:** `MapTab` (map + province sheet + place detail); **Search** screen; deep links
  `viego://province/{id}` and `viego://place/{id}`.
- **State:** React Query `['exploration','provinces'|'collection'|'place']`; the capture mutation
  invalidates collection + map so an unlock visibly fills the province.

## Open decisions

- None blocking. The unlock trigger (first Beat in the province) and heat model are settled from the
  prototype.
