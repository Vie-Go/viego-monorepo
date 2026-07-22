---
title: "ADR 0002 — Modular monolith with Spring Modulith"
description: "Build the backend as a Spring Modulith modular monolith whose modules are extractable to services."
---

# ADR 0002 — Modular monolith with Spring Modulith

- **Status:** Accepted · **Date:** 2026-07-22 · **Deciders:** VieGo team

## Context
VieGo has four clear [bounded contexts](../ddd-and-domain-model.md). Microservices-first adds
distributed-systems overhead a pre-PMF app doesn't need — but we expect some contexts to need
independent scaling/deployment later.

## Decision
Build the backend as a **modular monolith** using **Spring Modulith**:
- One Spring Boot app; each context is one **application module** under `com.viego.<module>`.
- Modules expose only a **named-interface API**; other packages are internal.
- Integration is primarily **asynchronous domain events** via a **transactional event log** (JPA).
- Boundaries are **verified in CI** (`ApplicationModules.verify()`); diagrams via `Documenter`.
- Each module owns its persistence (schema-per-module, no cross-module FKs).

This keeps a single deployable now while making each module
[extractable to a service later](../service-extraction-playbook.md).

## Consequences
- **+** Low operational overhead; enforced boundaries; events + owned data make extraction low-risk.
- **+** Modulith event externalization (`spring-modulith-events-kafka`) → broker with minimal change.
- **−** Requires discipline (no cross-module joins/imports); some calls modelled as events.

## Alternatives
- **Microservices from day one** — rejected: premature operational cost.
- **Unstructured monolith** — rejected: no boundaries, painful future extraction.
