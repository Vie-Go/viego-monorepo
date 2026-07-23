---
title: "Architecture Principles"
description: "The non-negotiable rules that govern every specification, design, and line of code."
---

# Architecture Principles

The rules everything obeys. A specification may not contradict these; to change one, add an
[ADR](decisions/).

## Product principles
1. **Cultural Pride First** — celebrate Vietnam's regional diversity authentically.
2. **Gamified Joy** — unlocks and streaks feel earned and delightful.
3. **Tactile Mobile Ergonomics** — fluid single-handed navigation, crisp feedback.
4. **Seamless Multi-region Experience** — frictionless language/theme switching, instant feedback.

## Product & UX non-negotiables
- **Mobile-first & adaptive** — design at the mobile viewport (~402×874) first.
- **Accessibility** — high contrast in light & dark, touch targets ≥ 44px, readable type.
- **Vietnamese + English parity** — no feature ships with VI or EN missing; nothing hard-coded.
- **Dual-theme by default** and **design tokens are law** (see [UX design](../ui-ux-design-document/)).

## Backend architecture non-negotiables
- **Modules are bounded contexts** — each context is one Spring Modulith module owning its logic
  and data end-to-end.
- **No shared tables across modules** — each module owns its schema; no cross-module FKs/joins;
  reference peers by **id only**.
- **Integrate via events, not internals** — communicate through published domain events, or a
  target module's **named-interface API**; never import another module's internal packages.
- **Extraction-ready by default** — `ApplicationModules.verify()` must pass in CI; every module
  must be liftable into a service without redesign ([playbook](service-extraction-playbook.md)).
- **Thin shared kernel** — only stable value objects (ids, `LocalizedText`) in `shared`.

## Cross-cutting engineering non-negotiables
- **API contract is the boundary** — FE/BE agree on OpenAPI; breaking changes are versioned.
- **Secure by default** — no secrets in source; auth on every non-public endpoint; least privilege.
- **Observable by default** — structured logs, metrics, traces everywhere.
- **Tested at the right altitude** — domain unit tests; `@ApplicationModuleTest` per module;
  critical flows end-to-end. See [Test Strategy](../../../../02-process-documentation/test-strategy.md).

## Decision-making
- Architecture decisions → [ADRs](decisions/).
- Behavioural decisions → [Core Specifications](../../../01-core-specifications/).
- The [ubiquitous language](ddd-and-domain-model.md) is authoritative.
