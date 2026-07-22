---
title: "1.1.3 Generated System Artifacts"
description: "Auto-generated from the Core Specifications — never hand-edited."
---

# 1.1.3 Generated System Artifacts

Produced automatically from the [Core Specifications](../01-core-specifications/) by the build
pipeline. **Do not hand-edit** — regenerate from the source spec.

| Artifact | Generated from | Doc |
|----------|----------------|-----|
| API Reference (Swagger UI / Redoc) | `rest-api.openapi.yaml` | [api-reference-documentation.md](api-reference-documentation.md) |
| Source code models / interfaces | OpenAPI + AsyncAPI; Modulith `Documenter` | [source-code-models.md](source-code-models.md) |
| Quality Assurance reports | Contract & spec-compliance tests | [quality-assurance-reports.md](quality-assurance-reports.md) |

Generation is wired in [CI/CD](../04-user-documentation/system-admin-documentation/ci-cd.md); the
QA gates that must pass are in the [Test Strategy](../../02-process-documentation/test-strategy.md).
