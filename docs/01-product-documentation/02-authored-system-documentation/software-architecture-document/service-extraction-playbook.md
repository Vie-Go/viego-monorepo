---
title: "Service Extraction Playbook"
description: "How to lift a Spring Modulith module into a standalone service when a real driver appears."
---

# Service Extraction Playbook

How to lift a module into an independent service **when — and only when — a real driver appears**
(independent scaling, deploy cadence, team ownership, or data isolation). The architecture makes
this mechanical, not a rewrite.

## Preconditions (already true if the [principles](architecture-principles.md) are followed)
- The module integrates only via **events** and its **`api`** interface.
- The module **owns its schema**; no peer joins its tables.
- Boundary tests pass; events are catalogued in [AsyncAPI](../../../01-core-specifications/api-system-specifications/domain-events.asyncapi.yaml).

## Steps
1. **Externalize the module's events.** Annotate published events with `@Externalized` and add
   `spring-modulith-events-kafka` (or `-amqp`). In-process listeners become topic subscribers —
   no domain code changes.
2. **Introduce a broker** (Kafka/RabbitMQ). Monolith and new service share the same topics.
3. **Split the data.** Move the module's schema to its own database instance. With no cross-module
   FKs, this is a copy + datasource repoint.
4. **Stand up the new service** containing only that module's packages + `shared`. Reuse the same
   `api` DTOs/events (publish `shared` + `*-api` as a small library).
5. **Replace synchronous `api` calls with a client + ACL.** Swap in a REST/messaging client
   behind the **same interface**; callers don't change.
6. **Cut over incrementally.** Run both in parallel; verify with the module's existing tests.
7. **Remove the module from the monolith** once the service owns it.

## Why each step is cheap
| Design choice | Payoff at extraction |
|---------------|----------------------|
| Events in `api/events`, transactional outbox | Reliable delivery survives the broker swap |
| Schema-per-module, no cross FKs | DB split is a repoint, not a migration project |
| Named-interface `api` only | Callers depend on a contract, not internals |
| Tiny, stable `shared` kernel | Little to duplicate across the boundary |
| Boundary tests in CI | Guarantees the above stayed true |

## Anti-patterns that block extraction (rejected in review)
- Cross-module joins or shared tables.
- Importing another module's internal classes.
- Passing entities (not ids/DTOs) across boundaries.
- Business logic in `shared`.
