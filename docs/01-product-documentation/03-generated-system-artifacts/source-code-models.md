---
title: "Source Code Models / Interfaces"
description: "Typed clients, DTOs, and module diagrams generated from the specs."
---

# Source Code Models / Interfaces

Typed code generated from the [Core Specifications](../01-core-specifications/) so FE and BE never
drift from the contract.

## What is generated
| Output | Tool | From |
|--------|------|------|
| **TypeScript API client + types** (app) | `openapi-typescript` / `orval` | `rest-api.openapi.yaml` |
| **Server DTO/interface stubs** (optional) | OpenAPI Generator (spring) | `rest-api.openapi.yaml` |
| **Event payload types** | AsyncAPI generator | `domain-events.asyncapi.yaml` |
| **Module structure diagrams** (PlantUML/C4) | Spring Modulith `Documenter` | backend source |

## Rules
- Generated code is **not** hand-edited; the spec is the source of truth.
- Regeneration runs in [CI](../04-user-documentation/system-admin-documentation/ci-cd.md); a diff
  in generated output on an unchanged spec fails the build.

> Placeholder: point to the generated packages/paths once the repos exist.
