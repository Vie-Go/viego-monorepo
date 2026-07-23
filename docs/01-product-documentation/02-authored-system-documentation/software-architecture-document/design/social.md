---
title: "Design — Social module (Friends, feeds & reactions)"
description: "Detailed design of the social module: friendships, invite links, the friend/Discover feed read models, reactions, and the FriendAdded/BeatReacted events."
---

# Design — Social module (Friends, feeds & reactions)

- **Module:** `social` · **Core feature:** Friends & feeds ·
  **Phase:** [P5 — Social](../../../../02-process-documentation/plans-estimates-schedules.md)
- **Spec:** [`social-feed.feature`](../../../01-core-specifications/executable-specifications/features/social/social-feed.feature)
- **Requirements:** [FR-SO-01…07](../../../01-core-specifications/requirements/functional-requirements.md#fr-so--social-friends-feeds--reactions) · constrained by [NFR-SEC-09](../../../01-core-specifications/requirements/non-functional-requirements.md#nfr-sec--security--privacy), [NFR-PERF-02](../../../01-core-specifications/requirements/non-functional-requirements.md#nfr-perf--performance)
- **New context** introduced by [ADR-0010](../decisions/0010-social-bounded-context-and-beat-backbone.md).
  A consumer of the backbone **`BeatCaptured`** — it fans captured Beats out to the right feeds.

## Purpose & scope

Make VieGo friends-first: manage **Friendships**, let an Explorer **add a friend** via an invite
link (`viego.app/add/@handle`) or QR, and build the two feed read models — the **friend feed** (Beats
whose audience includes me) and **Discover** (public Beats). Support lightweight **Reactions** (like,
bolt). Enforce that a Beat is only ever shown to its audience.

## Domain model

- **Friendship** *(aggregate root)* — a mutual link between two Explorers.
  - *Invariant:* symmetric; **at most one** Friendship per pair.
- **InviteLink** *(value object)* — `viego.app/add/@handle`; resolving + accepting creates a
  Friendship.
- **Feed** — read models projected from `BeatCaptured`: **friend feed** (audience includes me) and
  **Discover** (public). Not an aggregate — a materialised projection.
- **Reaction** *(entity)* — a `like` or `bolt` on a Beat, by an Explorer.

## Commands & events

| Direction | Name | Trigger / effect |
|-----------|------|------------------|
| Command | `AddFriend(explorerId, handle)` | Resolve handle → create the symmetric Friendship; emit `FriendAdded`. |
| **Publishes** | **`FriendAdded`** | `{ explorerId, friendId, at }`. |
| Command | `React(explorerId, beatId, kind)` | Record a like/bolt; emit `BeatReacted`. |
| **Publishes** | **`BeatReacted`** | `{ beatId, explorerId, kind, at }`. |
| Consumes | **`BeatCaptured`** (Content) | Project into the friend feed (recipients) and/or Discover (public). |
| Consumes | `ExplorerRegistered` (Identity) | Register the Explorer's handle for invite resolution. |

## REST API

| Method & path | Purpose | Notes |
|---------------|---------|-------|
| `GET /api/v1/feed/me` | Friend feed — Beats whose audience includes me | Freshest first |
| `GET /api/v1/discover` | Public Discover feed | Optional `near` bias |
| `GET /api/v1/friends` | The Explorer's friends | Online status |
| `POST /api/v1/friends/add/{handle}` | Add a friend from an invite link/QR | Emits `FriendAdded` |
| `POST /api/v1/beats/{id}/reactions` | React (like/bolt) | Emits `BeatReacted` |

Feeds return Beats with a **signed photo URL** and an `isFriend` flag; a friends-only Beat never
appears in another Explorer's Discover ([NFR-SEC-09](../../../01-core-specifications/requirements/non-functional-requirements.md#nfr-sec--security--privacy)).

## Persistence

- Schema **`social`** (owned).
- Tables: `friendship (explorer_a, explorer_b, since)`, `reaction (beat_id, explorer_id, kind)`,
  and feed projections `friend_feed_entry` / `discover_entry` built from `BeatCaptured`.
- No FK to peers — `explorer_id`, `beat_id` are id values; handles resolved from the local projection
  fed by `ExplorerRegistered`.
- Flyway: `db/migration/social/V1__init.sql`.
- **Cache** (Redis namespace `social:*`, [ADR 0007](../decisions/0007-redis-cache-and-token-rotation.md)):
  hot feed pages are cache-friendly; audience filtering is applied against the projection, never
  loosened by cache.

## Backend flow — fan a Beat out to feeds

```
BeatCaptured(beatId, explorerId, audience, recipients?, …)   (async, from Content)
  → social.infrastructure.listener.BeatCapturedListener
  → social.application.FanOutBeatService (tx)
      → audience = friends → append to each recipient's friend_feed
      → audience = public  → append to discover_entry (+ friends who follow the place)
```

Add-friend flow:

```
POST /api/v1/friends/add/@minh.dq
  → social.infrastructure.web.FriendController
  → social.application.AddFriendService (tx)
      → resolve @minh.dq → explorerId
      → create symmetric Friendship (idempotent)
      → publish FriendAdded
  ⇢ engagement listener raises a "new friend" notification (async)
```

## Mobile design ([feature `social`](../frontend-architecture.md))

- **Screens:** **Beats** (friend feed — big fresh moment + grid of recent), **Discover** (public
  cards, "verified by location"), **Add friends** (invite card with copy link / Zalo / Facebook / QR),
  the **share-link modal** (QR + link), and reactions on the **Beat detail modal**.
- **First-run:** the post-signup **Add friends** step surfaces the Explorer's own invite link before
  onboarding.
- **Navigation:** `FeedTab` (Beats) and `DiscoverTab` in the bottom nav; invite deep link
  `viego.app/add/@handle` opens the add-friend sheet.
- **State:** React Query `['social','feed'|'discover'|'friends']`; the capture mutation invalidates
  the friend feed so a friend's Beat appears live.

## Open decisions

- **Friend request vs. auto-accept** — does opening an invite link create a Friendship immediately or
  a pending request? Owner: Product · needed by P5. The prototype auto-adds; confirm before launch.
