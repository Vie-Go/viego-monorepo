---
title: "Deployment & Release"
description: "How the backend and mobile app are released."
---

# Deployment & Release

## Backend
- Packaged as an **OCI container** (Spring Boot buildpacks); one image = the whole modular monolith.
- Runtime: containerized (Kubernetes / managed platform — TBD).
- **Migrations:** Flyway runs on startup (per-module paths). Migrations are backward-compatible;
  use expand/contract for breaking schema changes.
- **Rollout:** rolling/blue-green, health-gated ([observability](observability.md)).
- **Rollback:** redeploy the previous image tag; migrations are forward-only, so design them safe.

## Mobile
- **iOS:** TestFlight → App Store; **Android:** Play internal/beta → production.
- Store review lead time means the API must stay **backward compatible** with released app
  versions — version the API and never break `/api/v1` for shipped clients.
- Consider OTA (Expo) for JS-only fixes where policy allows.

## Coordinated releases
- Ship additive API changes (BE) first, then the app release that consumes them.
- Track the minimum supported app version; gate removed endpoints behind it.

## Future: service extraction
An extracted module gets its **own pipeline, image, and cadence**; the broker carries its events.
See the [Service Extraction Playbook](../../02-authored-system-documentation/software-architecture-document/service-extraction-playbook.md).
