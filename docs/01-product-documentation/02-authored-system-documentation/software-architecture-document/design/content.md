---
title: "Design — Content module (Beats)"
description: "Detailed design of the content module: the Beat aggregate (photo check-ins), reviews, memories, media delivery, and the BeatCaptured backbone event."
---

# Design — Content module (Beats)

- **Module:** `content` · **Core feature:** Beat capture ·
  **Phase:** [P3 — Content: Beats](../../../../02-process-documentation/plans-estimates-schedules.md)
- **Spec:** [`beat-capture.feature`](../../../01-core-specifications/executable-specifications/features/content/beat-capture.feature)
- **Requirements:** [FR-CO-01…07](../../../01-core-specifications/requirements/functional-requirements.md#fr-co--content-beats-reviews--memories) · constrained by [NFR-SEC-*](../../../01-core-specifications/requirements/non-functional-requirements.md#nfr-sec--security--privacy), [NFR-PERF-03/04](../../../01-core-specifications/requirements/non-functional-requirements.md#nfr-perf--performance)
- **The heart of the product.** The **`BeatCaptured`** event it publishes is the
  [backbone](../../../../02-process-documentation/plans-estimates-schedules.md) that Exploration
  (unlock), Engagement (streak), and Social (feeds) all hang off — so this event contract must be
  right before those phases begin.

## Purpose & scope

Let an Explorer **capture a Beat** — a photo check-in — with the in-app camera. The Beat auto-tags
the current **Place** and **Province**, carries an **audience** (Friends list or Public) and an
optional caption, and is **immutable** once captured. Also own **Reviews** (traveller notes on a
Place, gated on having been there) and **Memories** (the Explorer's own Beats over time).

Precise location is used **only inside Vietnam**; outside, the province is not resolved and the Beat
is not pinned to a precise point ([FR-EX-09](../../../01-core-specifications/requirements/functional-requirements.md#fr-ex--exploration-map-places--province-unlocking)).

## Domain model

- **Beat** *(aggregate root, per capture)* — `id: BeatId`, `explorerId`, `photoRef`, `caption?`,
  `placeId?`, `provinceId`, `audience: Friends|Public`, `recipients?`, `capturedAt`.
  - *Invariants:* immutable after capture; always carries a resolved `provinceId` when inside
    Vietnam; a `Friends` audience carries a non-empty recipient list.
- **Review** *(entity)* — `explorerId`, `placeId`, `note`, `rating`, `capturedAt`. *Invariant:* only
  an Explorer with a Beat at the Place may leave one ("verified by location").
- **Memories** — a read model over the Explorer's own Beats, grouped by month.

## Commands & events

| Direction | Name | Trigger / effect |
|-----------|------|------------------|
| Command | `CaptureBeat(explorerId, photoRef, placeId?, audience, caption?)` | Resolve province, persist the Beat, emit `BeatCaptured`. |
| **Publishes** | **`BeatCaptured`** | `{ beatId, explorerId, provinceId, placeId?, audience, recipients?, at }` — the backbone event. |
| Command | `LeaveReview(explorerId, placeId, note, rating)` | Allowed only if the Explorer has a Beat there. |
| Consumes | `ExplorerRegistered` (Identity) | Initialise per-Explorer content state. |

Media (photos) live in **object storage / CDN**; the DB holds `photoRef` + metadata. Content is the
**publisher** of the core path, not a terminal consumer.

## REST API

| Method & path | Purpose | Notes |
|---------------|---------|-------|
| `POST /api/v1/beats` | Capture a Beat | Emits `BeatCaptured`; returns the Beat |
| `GET /api/v1/beats/{id}` | Read a Beat | **403** if the caller is not in the Beat's audience |
| `GET /api/v1/memories/me` | The Explorer's own Beats, by month | Drives the Memories screen |
| `POST /api/v1/places/{id}/reviews` | Leave a review | **403** if no Beat at the place |

Photos are returned as **short-lived signed/CDN URLs**, never proxied through the app server.

## Persistence

- Schema **`content`** (owned).
- Tables: `beat`, `review`, and a `memories` projection (or a query over `beat`).
- **Media** lives in object storage / CDN; the DB holds only `photo_ref` + metadata.
- No FK to `identity`/`exploration` — `explorer_id`, `place_id`, `province_id` are id values.
- Flyway: `db/migration/content/V1__init.sql`.
- **Cache** (Redis namespace `content:*`, [ADR 0007](../decisions/0007-redis-cache-and-token-rotation.md)):
  a Beat's resolved signed-URL and immutable metadata are cache-friendly; the **audience check** is
  always evaluated against the source of truth so a Beat is never served outside its audience from a
  stale cache.

## Backend flow — capture a Beat

```
POST /api/v1/beats  (photoRef, placeId?, audience, caption?)
  → content.infrastructure.web.BeatController
  → content.application.CaptureBeatService (tx)
      → resolve province from location (null outside Vietnam)
      → persist Beat (immutable)
      → publish BeatCaptured                 (event log, same tx)
  ⇢ exploration listener unlocks the province (first Beat there)  (async)
  ⇢ engagement listener advances the Streak                       (async)
  ⇢ social listener fans out to friend feeds / discover           (async)
```

This satisfies the `@ready` scenarios: friends-audience delivery, public capture, immutability, and
location suppression outside Vietnam.

## Mobile design ([feature `content`](../frontend-architecture.md))

- **Entry:** the centre **camera** button in the nav bar (and "Capture here" on a Place). The flow is
  Camera → **Send to…** (audience toggle Friends/Public + optional caption + friend picker) →
  **Beat sent!** confirmation → streak surface.
- **Screens/components:** Camera; Send/audience sheet; Beat-sent confirmation; **Beat detail modal**
  (photo, caption, likes, location tag); **Memories** calendar (Beats grouped by month with streak
  flame markers).
- **Optimistic UX:** show "Beat sent!" immediately; upload + fan-out complete in the background
  ([NFR-PERF-04](../../../01-core-specifications/requirements/non-functional-requirements.md#nfr-perf--performance)).
- **State:** React Query `['content','memories']` and per-Beat caches; capture mutation invalidates
  memories, collection, streak, and feed together.

## Open decisions

- **Review eligibility + moderation** ([FR-CO-07](../../../01-core-specifications/requirements/functional-requirements.md#fr-co--content-beats-reviews--memories)) —
  Owner: Product · needed by P3. The `@draft` scenario stays explicit until resolved.
