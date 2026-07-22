---
title: "API Reference Documentation"
description: "Interactive REST reference generated from the OpenAPI spec."
---

# API Reference Documentation

Interactive REST reference generated from
[`rest-api.openapi.yaml`](../01-core-specifications/api-system-specifications/rest-api.openapi.yaml).

## How it's produced
- **springdoc-openapi** serves the live spec at `/v3/api-docs` and Swagger UI at
  `/swagger-ui.html` from the running backend.
- A static **Redoc** bundle is generated in CI and published with the docs site.
- Async events are rendered from the
  [AsyncAPI spec](../01-core-specifications/api-system-specifications/domain-events.asyncapi.yaml)
  with the AsyncAPI generator.

## Where to find it
| Environment | REST reference |
|-------------|----------------|
| local | `http://localhost:8080/swagger-ui.html` |
| dev/staging/prod | `/<env>/swagger-ui.html` (behind auth as configured) |

> Placeholder: link the published Redoc/AsyncAPI HTML output here once CI is set up. This page
> describes the generator; the artifact itself is built, not committed.
