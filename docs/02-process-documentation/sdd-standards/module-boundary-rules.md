---
title: "Module Boundary Rules"
description: "The Spring Modulith rules every backend change must uphold."
---

# Module Boundary Rules

The rules that keep the modular monolith extractable. Enforced by `ApplicationModules.verify()`
in CI — a violation fails the build. Design rationale:
[SAD → Backend Modular Monolith](../../01-product-documentation/02-authored-system-documentation/software-architecture-document/backend-modular-monolith.md).

## Must
- One module per [bounded context](../../01-product-documentation/02-authored-system-documentation/software-architecture-document/ddd-and-domain-model.md):
  `identity`, `exploration`, `content`, `engagement`, `social`.
- Expose only the `api` **named interface**; keep `domain`/`application`/`infrastructure` internal.
- Integrate via **published events**; use a peer's `::api` only when a synchronous read is
  unavoidable (treat as an anti-corruption boundary).
- Own your data: schema-per-module, **no cross-module FKs or joins**, reference peers by **id**.
- Keep `shared` tiny: ids and `LocalizedText` only — no business logic.

## Must not
- Import another module's internal packages.
- Join or read another module's tables.
- Pass entities (not ids/DTOs) across boundaries.
- Put business logic in `shared`.

## Naming
- Events: past tense in `api/events` (`BeatCaptured`, `ProvinceUnlocked`).
- Use-case services: `<Verb><Noun>Service` (`CaptureBeatService`).
- Ports (interfaces) in `domain`; adapters in `infrastructure`.
- One aggregate root per transaction.
