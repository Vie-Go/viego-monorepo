---
title: "VieGo — Project Documentation"
description: "Knowledge base for VieGo: Spring Boot / Java 25 backend, React Native mobile, Spec-Driven Development, and DDD."
---

# VieGo — Project Documentation

Knowledge base for **VieGo**: a gamified app for discovering, unlocking, and
collecting Vietnam's regional cultural heritage — province by province.

**Stack:** Spring Boot (Java 25) modular monolith · React Native (iOS/Android) · PostgreSQL.
**Method:** Spec-Driven Development (SDD) with a Domain-Driven Design (DDD) model.

This site follows a standard Product / Process documentation taxonomy.

## 1. Project Documentation

### [1.1 Product Documentation](01-product-documentation/)
- **[1.1.1 Core Specifications](01-product-documentation/01-core-specifications/)** — the source of truth: [requirements (FRD/NFRD)](01-product-documentation/01-core-specifications/requirements/), API/system specs (OpenAPI, AsyncAPI), and executable BDD specs.
- **[1.1.2 Authored System Documentation](01-product-documentation/02-authored-system-documentation/)** — Software Architecture Document (C4, DDD, Spring Modulith) and UX design.
- **[1.1.3 Generated System Artifacts](01-product-documentation/03-generated-system-artifacts/)** — auto-generated API reference, code models, QA reports.
- **[1.1.4 User Documentation](01-product-documentation/04-user-documentation/)** — end-user, developer integration, and system-admin docs.

### [1.2 Process Documentation](02-process-documentation/)
Roadmaps & backlogs · SDD standards · plans/estimates/schedules · test strategy · release checklist · reports.

## Related repo files
- [`PRODUCT.md`](../PRODUCT.md) — product vision.
- [`DESIGN.md`](../DESIGN.md) — design system.
- [`prototype/`](../prototype/) — reference web prototype + canonical datasets.
- [`AGENTS.md`](../AGENTS.md) — how AI agents should use this knowledge base.
