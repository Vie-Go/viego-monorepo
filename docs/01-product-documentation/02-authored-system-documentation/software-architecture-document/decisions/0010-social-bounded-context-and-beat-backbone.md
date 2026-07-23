---
title: "ADR 0010 — Social bounded context and the BeatCaptured backbone"
description: "Add a fifth product module (social) and make BeatCaptured the backbone integration event, following the capture-app prototype."
---

# ADR 0010 — Social bounded context and the BeatCaptured backbone

- **Status:** Accepted · **Date:** 2026-07-23 · **Deciders:** VieGo team
- **Refines:** [ADR 0002 — Modular monolith with Spring Modulith](0002-modular-monolith-with-spring-modulith.md)

## Context

The [reference prototype](../../../../../prototype/VieGo.dc.html) reframed VieGo from a
cultural-heritage *collection* game into a **social capture** app. The central object is now a
**Beat** — a photo check-in that auto-tags its location, keeps a daily streak alive, unlocks the
province it was taken in, and lands on friends' maps and feeds. This introduced a large **social**
surface (friendships, invite links, a friend feed, a public Discover feed, reactions) that did not
map cleanly onto the original four contexts (identity/exploration/engagement/content).

ADR-0002 named "four clear bounded contexts". That framing no longer fits: friend graph, feeds, and
reactions are a coherent responsibility of their own, and the integration backbone shifted from
`ProvinceUnlocked` to `BeatCaptured`.

## Decision

1. **Add a fifth product module — `social`** — owning Friendship, invite links, the friend/Discover
   feed read models, and Reactions. It keeps the same modular-monolith rules from ADR-0002 (own
   schema, no cross-module FKs, integrate via events/`::api`).
2. **`BeatCaptured` is the backbone event.** `content` publishes it on capture; `exploration`
   (unlock the first Beat's province), `engagement` (advance the streak), and `social` (fan out to
   feeds) consume it. `ProvinceUnlocked` remains, now a secondary event derived from capture.
3. **`content` is repurposed** from audio "Cultural Beats"/trivia to **Beats (photo check-ins),
   reviews, and memories**. The audio-player / heritage-gating model is dropped (see the
   [domain model](../ddd-and-domain-model.md)).

The product modules are therefore: `identity`, `exploration`, `content`, `engagement`, `social`
(+ the `shared` open kernel).

## Consequences

- **+** Friend graph and feeds live behind a clean boundary and can be extracted independently later.
- **+** A single backbone event (`BeatCaptured`) makes the core loop (unlock + streak + feed) a
  fan-out, matching how the prototype behaves.
- **−** One more module to wire, own a schema, and cover in `ApplicationModules.verify()`.
- **−** The Phase-0 skeleton and platform contract are updated to five empty modules.

## Alternatives

- **Fold social into identity + content** — rejected: overloads two contexts with an unrelated
  responsibility and blurs their boundaries.
- **Keep `ProvinceUnlocked` as the backbone** — rejected: unlock is now a *consequence* of capture,
  not the trigger; streak and feeds must react to the capture itself.
