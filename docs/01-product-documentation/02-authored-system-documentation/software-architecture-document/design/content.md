---
title: "Design — Content module (Heritage access)"
description: "Detailed design of the content module: regional heritage, cultural beats, trivia, media delivery, and unlock-gated access."
---

# Design — Content module (Heritage access)

- **Module:** `content` · **Core feature:** Regional heritage access ·
  **Phase:** [P4 — Content: Heritage & Beats](../../../../02-process-documentation/plans-estimates-schedules.md)
- **Spec:** [`heritage-access.feature`](../../../01-core-specifications/executable-specifications/features/content/heritage-access.feature)
- **Requirements:** [FR-CO-01…05](../../../01-core-specifications/requirements/functional-requirements.md#fr-co--content-heritage-access) · constrained by [NFR-SEC-*](../../../01-core-specifications/requirements/non-functional-requirements.md#nfr-sec--security--privacy), [NFR-PERF-03](../../../01-core-specifications/requirements/non-functional-requirements.md#nfr-perf--performance)
- **The cultural payoff.** A pure **consumer** of the backbone `ProvinceUnlocked` event — access
  is granted by unlocking, never requested directly — so it comes after Exploration (P2).

## Purpose & scope

Deliver a Province's **Regional Heritage** — **Cultural Beats** (audio) and **Trivia** — but only
for provinces the Explorer has **unlocked**. Locked provinces are **gated** (access refused, prompt
to unlock). Content renders in the Explorer's **preferred language** (VI/EN).

## Domain model

- **Regional Heritage** *(aggregate root, per Province)* — the cultural payload for a province.
- **Cultural Beat** *(entity)* — `id`, `title: LocalizedText`, `audioRef` (media pointer, not bytes).
- **Trivia** *(entity)* — `question: LocalizedText`, `answers`.
- **HeritageAccess** *(per Explorer × Province)* — the grant created when a province is unlocked.
  - *Invariant:* heritage is readable **iff** a grant exists; no grant ⇒ **403**, never a partial
    read.

## Commands & events

| Direction | Name | Trigger / effect |
|-----------|------|------------------|
| Consumes | **`ProvinceUnlocked`** (Exploration) | Create a `HeritageAccess` grant for `{explorerId, provinceId}`. |
| Consumes | `ExplorerRegistered` (Identity) | (Optional) initialise per-Explorer content state. |
| Consumes | `StreakAdvanced` (Engagement) | Hook for streak-based content surfacing (future). |
| Command | `GetHeritage(explorerId, provinceId)` | Return beats + trivia **iff** a grant exists, else 403. |

Content **publishes nothing** on the core path — it is a terminal consumer, which is why it can
land last without blocking anything downstream.

## REST API

| Method & path | Purpose | Notes |
|---------------|---------|-------|
| `GET /api/v1/provinces/{id}/heritage` | Beats + trivia for an unlocked province | **403 + prompt to unlock** when locked; `LocalizedText` per `Accept-Language` |
| `GET /api/v1/beats/{id}/audio` | Resolve a beat's playable media | Returns a **signed/CDN URL**, not bytes |

Gating is enforced server-side: the grant is checked on every heritage read, so a client can never
reach content for a province it hasn't unlocked.

## Persistence

- Schema **`content`** (owned).
- Tables: `regional_heritage`, `cultural_beat`, `trivia`, `heritage_access (explorer_id,
  province_id, granted_at)`.
- **Media** lives in **object storage / CDN**; the DB holds only `audioRef` + metadata. Reads
  return short-lived **signed URLs**.
- No FK to `exploration` — the grant is created from the `ProvinceUnlocked` listener using id
  values.
- Flyway: `db/migration/content/V1__init.sql` (+ seed migration for launch-province content).
- **Cache** (Redis namespace `content:*`, [ADR 0007](../decisions/0007-redis-cache-and-token-rotation.md)):
  heritage metadata (beats + trivia + `LocalizedText`) is read-heavy and changes only on editorial
  updates — cached per `{provinceId, locale}` with a long TTL, evicted when content is republished.
  Only the **metadata** is cached; media stays behind signed CDN URLs, and the `HeritageAccess` grant
  is **always checked against the source of truth** so gating is never served stale from cache.

## Backend flow — access is granted by unlocking

```
ProvinceUnlocked(explorerId, provinceId, at)      (async, from Exploration)
  → content.infrastructure.listener.ProvinceUnlockedListener
  → content.application.GrantHeritageAccessService (tx)
      → create HeritageAccess(explorerId, provinceId)   (idempotent)

GET /api/v1/provinces/HUE/heritage
  → content.infrastructure.web.HeritageController
  → content.application.GetHeritageService
      → HeritageAccess exists? no → 403 + "unlock HUE first"
                              → yes → return beats + trivia in preferred language
```

This satisfies all three `@ready` scenarios: available-when-unlocked, gated-when-locked, and
granted-on-`ProvinceUnlocked`.

## Mobile design ([feature `content`](../frontend-architecture.md))

- **Entry:** heritage opens from **province detail** (Exploration), not a top-level tab — content
  is the reward for unlocking.
- **Screens/components:** Heritage screen; **audio beat player**; **Trivia UI**; a **gating UX**
  (when locked → prompt/CTA to go unlock the province).
- **Localization:** all beat titles, trivia, and copy come from `LocalizedText` and render in the
  active locale — VI/EN parity is audited in P5.
- **State:** React Query `['content','heritage',provinceId]`; a 403 renders the unlock prompt
  rather than an error toast.
- **Media:** the player fetches a signed URL then streams; handle expiry by re-requesting.

## Open decisions

- No blocking product decision unique to Content. Depends on the
  **[unlock condition](exploration.md)** (P2) upstream and on seeding **real
  heritage content** for the launch provinces (shared task in P4).
