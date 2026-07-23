---
title: "Agile Product Roadmaps & Backlogs"
description: "Roadmap themes and the prioritized backlog of features."
---

# Agile Product Roadmaps & Backlogs

> **Execution roadmap:** the phased, two-engineer plan from scratch to production lives in
> [Plans, Estimates, Schedules](plans-estimates-schedules.md). This page holds the product
> themes and backlog that feed it.

## Roadmap themes
| Horizon | Focus |
|---------|-------|
| **Now** | Foundations + the core loop: authentication, map & places, **capture a Beat** → unlock + memories |
| **Next** | Engagement: daily streaks & milestones; Social: friends, feeds, Discover, reactions |
| **Later** | Richer notifications, offline capture queue, more languages, place bookmarks/reviews depth |

## Backlog (feature specs)
Each item becomes an [executable spec](../01-product-documentation/01-core-specifications/executable-specifications/)
plus the API/system contract before build.

| Item | Context | Status |
|------|---------|--------|
| Authentication (Email/Google/Facebook/Zalo) + handle | Identity | draft |
| Map, places (POIs), search | Exploration | draft |
| Province unlocking (via first capture) | Exploration | draft |
| Collection view | Exploration | draft |
| **Beat capture** (photo, audience, memories) | Content | draft |
| Reviews (verified by location) | Content | backlog |
| Daily capture streak & milestones/badges | Engagement | draft |
| Notifications | Engagement | draft |
| Friends, invite links, friend feed & Discover | Social | draft |
| Reactions (like/bolt) | Social | draft |
| Language & theme preferences | Identity | draft |

## Open product decisions (block "ready")
- The **day/timezone rule** for the streak day boundary.
- **Review** eligibility + moderation.
- **Friend-request vs. auto-accept** on invite links.
- **Account linking** across providers.

> **Resolved from the prototype:** unlock = capture your first Beat in the province; the daily ritual
> = capturing a Beat.

> Keep this in sync with the executable specs and the API/system specifications.
