---
title: "Design — Engagement module (Daily streak)"
description: "Detailed design of the engagement module: the Streak aggregate, discovery ritual, timezone-aware day rules, and StreakAdvanced/StreakBroken events."
---

# Design — Engagement module (Daily streak)

- **Module:** `engagement` · **Core feature:** Daily discovery streak ·
  **Phase:** [P3 — Engagement: Streaks](../../../../02-process-documentation/plans-estimates-schedules.md)
- **Spec:** [`daily-streak.feature`](../../../01-core-specifications/executable-specifications/features/engagement/daily-streak.feature)
- **Requirements:** [FR-EN-01…07](../../../01-core-specifications/requirements/functional-requirements.md#fr-en--engagement-daily-streak) · constrained by [NFR-REL-*](../../../01-core-specifications/requirements/non-functional-requirements.md#nfr-rel--reliability--data-integrity)
- **Consumer of the backbone:** listens to `ProvinceUnlocked` (from Exploration, P2) and
  `ExplorerRegistered` (from Identity, P1) — so P2's event contract must be settled first.

## Purpose & scope

Turn daily discovery into a habit: count **consecutive days** on which the Explorer completes the
**Discovery Ritual**, advancing the **Streak** once per day, resetting it when a day is missed, and
never letting the recorded **longest** streak shrink. Emit `StreakAdvanced` / `StreakBroken` for
downstream surfaces (Content listens to `StreakAdvanced`).

The precise **definition of the discovery ritual** and the **timezone/day boundary** are **open
decisions** (see *Open decisions* below); the design isolates both so the streak arithmetic is
stable.

## Domain model

- **Streak** *(aggregate root, per Explorer)* — `current`, `longest`, `lastRitualDate`.
  - *Invariants:*
    - advances **at most once per calendar day** (idempotent within a day);
    - a **missed day resets** `current` to 0 and emits `StreakBroken`;
    - `longest` is **monotonic** — it never decreases, even after a break.
- **Discovery Ritual** — the qualifying daily activity (definition pending). Candidate trigger:
  a `ProvinceUnlocked` counts as the day's ritual, plus/or an explicit ritual action.
- **DayClock** *(port)* — resolves "today" for an Explorer under the agreed timezone rule; injected
  so tests can control the clock (the spec evaluates breaks with clock control).

## Commands & events

| Direction | Name | Trigger / effect |
|-----------|------|------------------|
| Command | `CompleteRitual(explorerId, at)` | If not already advanced today → `current++`, update `longest`, emit `StreakAdvanced`; else no-op. |
| Command | `EvaluateStreak(explorerId, now)` | If the last ritual is older than one day → reset to 0, emit `StreakBroken`. |
| **Publishes** | **`StreakAdvanced`** | `{ explorerId, current, at }`. |
| **Publishes** | **`StreakBroken`** | `{ explorerId, longest, at }`. |
| Consumes | `ProvinceUnlocked` (Exploration) | Drives ritual completion (candidate rule). |
| Consumes | `ExplorerRegistered` (Identity) | Create a zeroed Streak for the new Explorer. |

## REST API

| Method & path | Purpose | Notes |
|---------------|---------|-------|
| `GET /api/v1/streaks/me` | Current + longest streak, last ritual date | Drives StreakTab |
| `POST /api/v1/streaks/me/ritual` | Explicitly complete today's ritual | Idempotent per day; may be superseded by the event-driven rule once the ritual is defined |

Break evaluation runs on read and/or a scheduled sweep so a streak breaks even when the Explorer
never opens the app.

## Persistence

- Schema **`engagement`** (owned).
- Table: `streak (explorer_id PK, current, longest, last_ritual_date, updated_at)`.
- No FK to `identity`/`exploration` — peers referenced by id value.
- Flyway: `db/migration/engagement/V1__init.sql`.

## Backend flow — ritual advances the streak

```
ProvinceUnlocked(explorerId, provinceId, at)      (async, from Exploration)
  → engagement.infrastructure.listener.ProvinceUnlockedListener
  → engagement.application.CompleteRitualService (tx)
      → DayClock.today(explorerId)
      → Streak.advanceFor(today)   → already advanced today? no-op
                                    → else current++, longest = max(longest,current)
      → publish StreakAdvanced      (event log, same tx)
```

Missing-day path: `EvaluateStreak` sees `lastRitualDate` older than one day → `current = 0`,
`longest` unchanged, emit `StreakBroken` (spec: *"my longest streak is still at least 4"*).

## Mobile design ([feature `engagement`](../frontend-architecture.md))

- **Navigation:** `StreakTab` — streak counter, daily ritual prompt, milestone/reward surfaces.
- **Components:** animated streak counter; daily ritual prompt/CTA; basic milestone/reward cards.
- **State:** React Query `['engagement','streak']`; invalidated by the same unlock mutation that
  drives Exploration, so unlocking a province visibly advances the streak in one refresh.
- **Motion:** counter animation respects **reduced-motion**; celebratory reward surfaces stay
  subtle.

## Open decisions

- **Discovery ritual definition** + **day/timezone rule** — Owner: Product · **needed by P3**.
  The `@draft` scenario *"Definition of the discovery ritual"* stays explicit until resolved;
  `DayClock` and the ritual trigger are the two seams that absorb whatever is decided.
