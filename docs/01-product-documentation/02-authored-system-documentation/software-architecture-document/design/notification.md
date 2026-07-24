---
title: "Design — Notification module (Delivery sink)"
description: "Detailed design of the notification module: the Notification aggregate, device tokens, the fan-in listeners from every context, in-app feed + push delivery, and the NotificationRaised event."
---

# Design — Notification module (Delivery sink)

- **Module:** `notification` · **Role:** the system's single delivery sink ·
  **Phase:** [P4 — Engagement/Notifications](../../../../02-process-documentation/plans-estimates-schedules.md)
  (first real consumer lands with the streak; Exploration/Social publishers join in P2/P5)
- **Requirements:** [FR-EN-08](../../../01-core-specifications/requirements/functional-requirements.md#fr-en--engagement-streaks-milestones--notifications)
  (notifications the Explorer receives) · constrained by
  [NFR-REL-*](../../../01-core-specifications/requirements/non-functional-requirements.md#nfr-rel--reliability--data-integrity)
- **Consumer of the backbone (indirectly):** does not listen to `BeatCaptured`; it listens to the
  *downstream* events that capture, unlock, streak, and social activity produce.

## Why this is its own module

"Tell the user something happened" is a concern that would otherwise smear across every context:
Engagement would know about push tokens, Social would format copy, Exploration would call an email
service. Pulling it into one **delivery sink** inverts that — peers publish *what happened* as
domain events, and `notification` alone owns *whether the Explorer is told* and *through which
channel*. The result is a module every arrow points **into** and none point out of: no peer depends
on `notification`, so notification concerns never leak back into the domain.

This is the [Observer / fan-in](../backend-modular-monolith.md#how-the-modules-communicate) shape:
many publishers, one consumer, dependency arrows pointing at the consumer.

## Purpose & scope

- Record a **Notification** per noteworthy event, addressed to one Explorer, with the payload
  frozen at the moment it happened.
- Expose the Explorer's notification **feed** and an **unread count**; let them mark items read.
- Deliver out-of-app via **push** to the Explorer's registered **device tokens**.
- Emit **`NotificationRaised`** so a push adapter (or later, email) reacts without this module
  depending on it.

**Out of scope:** the streak/badge logic itself (Engagement), feed projections (Social), and the
copy/localization of each row (rendered client-side from `kind` + `payload`).

## Domain model

- **Notification** *(aggregate root)* — `id`, `recipientId`, `kind`, `payload` (JSON, immutable),
  `isRead`, `readAt`, `createdAt`.
  - *Invariants:*
    - immutable except for read state — a later change in a peer context never rewrites what the
      Explorer already saw;
    - **`markRead` is idempotent** — re-reading never moves `readAt`.
- **NotificationKind** *(value object / enum)* — one per publishing context: `STREAK_REMINDER`,
  `MILESTONE_REACHED`, `PROVINCE_UNLOCKED`, `FRIEND_ADDED`, `BEAT_REACTED`, `FRIEND_BEAT`,
  `PLACE_NEARBY`. The **kind**, not the payload, decides how a row renders and which channels apply.
- **DeviceToken** *(entity)* — `id`, `explorerId`, `token` (unique), `platform` (`IOS`/`ANDROID`),
  `lastSeenAt`. One Explorer may have several.

## Commands & events

| Direction | Name | Trigger / effect |
|-----------|------|------------------|
| Consumes | **`MilestoneReached`** (Engagement) | Record a `MILESTONE_REACHED` notification. *(First consumer built — P4.)* |
| Consumes | `StreakReminder` / streak-at-risk (Engagement) | Record a `STREAK_REMINDER`. |
| Consumes | `ProvinceUnlocked` (Exploration) | Record a `PROVINCE_UNLOCKED`. *(P2 publisher.)* |
| Consumes | `FriendAdded` (Social) | Record a `FRIEND_ADDED`. *(P5 publisher.)* |
| Consumes | `BeatReacted` (Social) | Record a `BEAT_REACTED`. *(P5 publisher.)* |
| Consumes | `ExplorerRegistered` (Identity) | Nothing yet — reserved for a welcome notification / token bootstrap. |
| **Publishes** | **`NotificationRaised`** | `{ notificationId, recipientId, kind, raisedAt }` — the seam a push/email channel reacts to. |

Every listener funnels through one `NotificationService.raise(recipientId, kind, payload)` so the
rules about what an Explorer may receive live in exactly one place.

## REST API

| Method & path | Purpose | Notes |
|---------------|---------|-------|
| `GET /api/v1/notifications/me` | The Explorer's notifications, newest first | Notifications screen; paged |
| `GET /api/v1/notifications/me/unread-count` | Unread badge count | Cheap; backed by a partial index |
| `POST /api/v1/notifications/{id}/read` | Mark one read | Idempotent |
| `POST /api/v1/notifications/me/read-all` | Mark all read | Idempotent |
| `PUT /api/v1/notifications/me/device-tokens` | Register/refresh a push token | Body: `{ token, platform }` |

> **Moved from Engagement.** `GET /api/v1/notifications/me` previously sat under the engagement
> design; it now belongs to this module. The path is unchanged, so the mobile client and the
> [OpenAPI contract](../../../01-core-specifications/api-system-specifications/rest-api.openapi.yaml)
> are unaffected.

## Persistence

- Schema **`notification`** (owned) — managed by its own `notificationFlyway` bean, its own
  `notification.flyway_schema_history`.
- Tables:
  - `notifications (id PK, recipient_id, kind, payload_json, is_read, read_at, created_at)`
    — indexes: `(recipient_id, created_at DESC)` for the feed; a **partial** index on
    `(recipient_id, is_read) WHERE is_read = FALSE` for the unread badge.
  - `device_tokens (id PK, explorer_id, token UNIQUE, platform, last_seen_at, created_at)`.
- Keys are **UUIDv7** via the shared `BaseEntity` ([ADR-0014](../decisions/0014-uuidv7-primary-keys.md)).
- **No FK to peers** — `recipient_id` / `explorer_id` are logical id values
  ([schema-per-module](../backend-modular-monolith.md#persistence--data-ownership)).

## Backend flow — a milestone becomes a notification

```
BeatCaptured → engagement advances the Streak → crosses a milestone
  → engagement publishes MilestoneReached                         (event log, same tx)
  → notification.listener.MilestoneReachedNotificationListener    (separate tx, async)
      → NotificationService.raise(recipientId, MILESTONE_REACHED, payload)
          → save Notification
          → publish NotificationRaised                            (event log, same tx)
  → push adapter consumes NotificationRaised
      → look up recipient's DeviceTokens → deliver                (separate tx, async)
```

Because each hop is its own transaction, a push-delivery failure can never roll back the streak
that earned the badge, and the Modulith event log makes each hop at-least-once.

## Mobile design ([feature `notifications`](../frontend-architecture.md))

- **Surfaces:** the **Notifications** screen (typed rows keyed by `kind` — streak, milestone, friend
  added, reaction, friend beat, place nearby); an **unread badge** on the tab bar.
- **Rendering:** each row's copy is built **client-side** from `kind` + `payload` via localized keys
  (`notification.kind.milestoneReached`, …) — the server stores data, never rendered strings, so
  VI/EN and future languages need no backend change.
- **Push:** the app registers its device token via `PUT …/device-tokens` on launch/permission grant.
- **State:** React Query `['notification','feed'|'unreadCount']`; invalidated on `read`/`read-all`
  and on push receipt so the badge clears in one refresh.

## Open decisions

- **Push provider** (Expo Push vs. FCM/APNs direct) — Owner: Eng · needed when push delivery is
  built. `NotificationRaised` is the seam that absorbs the choice; nothing upstream changes.
- **Per-kind delivery preferences** (which kinds go to push vs. in-app only) — Owner: Product. The
  single `NotificationService.raise` funnel is where this rule will live.
- **Retention** (how long read notifications are kept before pruning) — Owner: Product/Eng.
