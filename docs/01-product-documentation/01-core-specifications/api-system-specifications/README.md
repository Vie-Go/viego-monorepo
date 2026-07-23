---
title: "API / System Specifications"
description: "REST (OpenAPI), async events (AsyncAPI), and canonical data schemas — the interface contracts."
---

# API / System Specifications

The machine-readable contracts between the mobile app, the backend, and between backend
modules. These **replace traditional PRDs/tech-design docs for system interfaces**.

| File | Contract | Consumers |
|------|----------|-----------|
| [`rest-api.openapi.yaml`](rest-api.openapi.yaml) | Synchronous REST API (client ↔ backend) | React Native app, integrators |
| [`domain-events.asyncapi.yaml`](domain-events.asyncapi.yaml) | Asynchronous domain events between Spring Modulith modules (and future services) | `identity`, `exploration`, `content`, `engagement`, `social` |
| [`data-schemas.md`](data-schemas.md) | Canonical province/ward/place datasets + the Beat/Review shapes | `exploration` & `content` modules, map UI |

## Conventions
- **REST:** resource-oriented, `/api/v1/...`, JSON, RFC 9457 Problem Details for errors,
  `Accept-Language` (vi/en). Full guidelines: [SDD Standards → API design](../../../../02-process-documentation/sdd-standards/api-design-guidelines.md).
- **Events:** past-tense names, ids/primitives only, transactional outbox delivery. Design
  rationale: [SAD → Backend Modular Monolith](../../../02-authored-system-documentation/software-architecture-document/backend-modular-monolith.md).
- **Source of truth:** these files are edited by hand and reviewed; Swagger UI / Redoc and
  client models are [generated](../../../03-generated-system-artifacts/) from them.
