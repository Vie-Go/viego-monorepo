---
title: "ADR 0005 — PostgreSQL + event-driven module integration"
description: "PostgreSQL with schema-per-module and domain events over a transactional outbox."
---

# ADR 0005 — PostgreSQL + event-driven module integration

- **Status:** Proposed · **Date:** 2026-07-22 · **Deciders:** Vie-Go team

## Context
The [modular monolith](0002-modular-monolith-with-spring-modulith.md) needs a datastore and an
integration mechanism that keep modules independent and **extractable**.

## Decision (proposed)
- **PostgreSQL** as the primary datastore.
- **Schema-per-module**; **no cross-module foreign keys or joins**; peers referenced by id only.
- **Flyway** migrations per module (`db/migration/<module>`).
- **Domain events** via Spring Modulith with the **JPA event-publication log** (transactional
  outbox). On extraction/scaling, switch to **externalized events**
  (`spring-modulith-events-kafka` / `-amqp`) with minimal code change.

## Consequences
- **+** Clear data ownership; splitting the DB per service later is straightforward.
- **+** Transactional outbox → reliable delivery; broker swap is configuration-level.
- **−** No cross-module SQL joins — read models compose via APIs or replicated data.

## Open questions
- Confirm PostgreSQL vs. a managed alternative.
- Read-model strategy for cross-context views (e.g. Explorer dashboard).
