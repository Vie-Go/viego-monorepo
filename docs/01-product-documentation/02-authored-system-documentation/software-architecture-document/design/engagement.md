---
title: "Design — Engagement module (Daily streak)"
description: "Detailed design of the engagement module: the Streak aggregate, capture-driven daily ritual, milestones/badges, notifications, and StreakAdvanced/StreakBroken/MilestoneReached events."
---

# Design — Engagement module (Daily streak)

- **Module:** `engagement` · **Core feature:** Daily capture streak ·
  **Phase:** [P4 — Engagement: Streaks](../../../../02-process-documentation/plans-estimates-schedules.md)
- **Spec:** [`daily-streak.feature`](../../../01-core-specifications/executable-specifications/features/engagement/daily-streak.feature)
- **Requirements:** [FR-EN-01…09](../../../01-core-specifications/requirements/functional-requirements.md#fr-en--engagement-streaks-milestones--notifications) · constrained by [NFR-REL-*](../../../01-core-specifications/requirements/non-functional-requirements.md#nfr-rel--reliability--data-integrity)
- **Consumer of the backbone:** listens to `BeatCaptured` (from Content) — **capturing a Beat is the
  daily ritual** — plus `ProvinceUnlocked`, `FriendAdded`, and `ExplorerRegistered`.

## Purpose & scope

Turn daily capture into a habit: count **consecutive days** on which the Explorer captured at least
one **Beat**, advancing the **Streak** once per day, resetting it when a day is missed, and never
letting the recorded **longest** streak shrink. Award a **Badge** at streak milestones (e.g. 7 days →
"Tuần Rực Lửa"), and surface **notifications**. Emit `StreakAdvanced` / `StreakBroken` /
`MilestoneReached`.

The **ritual is settled**: capturing a Beat. The **day/timezone boundary** remains an open decision.

## Domain model

- **Streak** *(aggregate root, per Explorer)* — `current`, `longest`, `lastCaptureDate`.
  - *Invariants:*
    - advances **at most once per calendar day** (idempotent within a day);
    - a **missed day resets** `current` to 0 and emits `StreakBroken`;
    - `longest` is **monotonic** — it never decreases, even after a break.
- **Milestone** *(entity)* — a streak threshold (e.g. 7) that awards a named **Badge**.
- **Notification** *(entity)* — a surfaced event (streak reminder, like, friend Beat, milestone, new
  place nearby).
- **DayClock** *(port)* — resolves "today" under the agreed timezone rule; injected so tests control
  the clock.

## Commands & events

| Direction | Name | Trigger / effect |
|-----------|------|------------------|
| Consumes | **`BeatCaptured`** (Content) | If not already advanced today → `current++`, update `longest`, emit `StreakAdvanced`; on crossing a milestone, emit `MilestoneReached`. |
| Command | `EvaluateStreak(explorerId, now)` | If the last capture is older than one day → reset to 0, emit `StreakBroken`. |
| **Publishes** | **`StreakAdvanced`** | `{ explorerId, newCount, at }`. |
| **Publishes** | **`StreakBroken`** | `{ explorerId, previousCount, at }`. |
| **Publishes** | **`MilestoneReached`** | `{ explorerId, milestone, badge, at }`. |
| Consumes | `ProvinceUnlocked` (Exploration) | Notification: province added to collection. |
| Consumes | `FriendAdded` (Social) | Notification: new friend. |
| Consumes | `ExplorerRegistered` (Identity) | Create a zeroed Streak for the new Explorer. |

## REST API

| Method & path | Purpose | Notes |
|---------------|---------|-------|
| `GET /api/v1/streaks/me` | Current + longest streak, last capture date, this-week view | Drives the streak badge + profile |
| `GET /api/v1/notifications/me` | The Explorer's notifications | Notifications screen |

Break evaluation runs on read and/or a scheduled sweep so a streak breaks even when the Explorer
never opens the app.

## Persistence

- Schema **`engagement`** (owned).
- Tables: `streak (explorer_id PK, current, longest, last_capture_date, updated_at)`,
  `badge (explorer_id, milestone, awarded_at)`, `notification`.
- No FK to peers — referenced by id value.
- Flyway: `db/migration/engagement/V1__init.sql`.

## Backend flow — capture advances the streak

```
BeatCaptured(explorerId, …, at)                  (async, from Content)
  → engagement.infrastructure.listener.BeatCapturedListener
  → engagement.application.AdvanceStreakService (tx)
      → DayClock.today(explorerId)
      → Streak.advanceFor(today)   → already advanced today? no-op
                                    → else current++, longest = max(longest,current)
      → crossed a milestone?       → award Badge, emit MilestoneReached
      → publish StreakAdvanced      (event log, same tx)
```

Missing-day path: `EvaluateStreak` sees `lastCaptureDate` older than one day → `current = 0`,
`longest` unchanged, emit `StreakBroken`.

## Mobile design ([feature `engagement`](../frontend-architecture.md))

- **Surfaces:** the streak flame badge in the header/nav; the **Snap home** "Day N — chụp một tấm
  để giữ lửa" prompt; the **Beat sent!** streak card; the milestone **celebration** screen (confetti,
  badge unlocked); a **this-week** row on the profile; a **relight** banner when broken.
- **Notifications** screen with typed rows (streak, like, friend beat, place nearby, badge).
- **State:** React Query `['engagement','streak'|'notifications']`; invalidated by the capture
  mutation so a Beat visibly advances the streak in one refresh.
- **Motion:** counter + celebration respect **reduced-motion**.

## Open decisions

- **Day/timezone rule** ([FR-EN-09](../../../01-core-specifications/requirements/functional-requirements.md#fr-en--engagement-streaks-milestones--notifications)) —
  Owner: Product · needed by P4. `DayClock` is the seam that absorbs whatever is decided.
