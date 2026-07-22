---
title: "Test Strategy"
description: "Contract- and spec-focused testing across backend and mobile."
---

# Test Strategy

Testing centers on the [Core Specifications](../01-product-documentation/01-core-specifications/):
prove the implementation matches the **contract** (OpenAPI/AsyncAPI) and the **behaviour** (BDD).

## Backend
| Level | Tool | Scope |
|-------|------|-------|
| Domain unit | JUnit 5 | Aggregates/VOs, invariants (e.g. no double unlock) |
| Module integration | `@ApplicationModuleTest` (Modulith `Scenario`) | One module + its events/listeners |
| Persistence slice | `@DataJpaTest` + Testcontainers (Postgres) | Repositories against real Postgres |
| Web slice | `@WebMvcTest` | Controllers, serialization, error model |
| **Contract** | Provider tests vs. `rest-api.openapi.yaml` | API matches the OpenAPI contract |
| **Spec compliance (BDD)** | Cucumber over the [Gherkin features](../01-product-documentation/01-core-specifications/executable-specifications/) | Business rules behave as specified |
| **Boundary** | `ApplicationModules.verify()` | Module rules intact (extraction-ready) |
| End-to-end | `@SpringBootTest` + Testcontainers | Critical cross-module flows |

## Mobile
| Level | Tool | Scope |
|-------|------|-------|
| Unit | Jest | Logic, hooks, formatters |
| Component | RN Testing Library | Rendering, interaction, a11y |
| **Contract** | MSW mocks generated from OpenAPI | API hooks vs. the agreed contract |
| E2E | Detox / Maestro | Core loop on device/simulator |

## Cross-cutting
- Test **both themes** and **both locales** for key screens (parity is a principle).
- Contract tests on both sides catch FE/BE drift early — regenerate mocks when the spec changes.
- All gates run in [CI](../01-product-documentation/04-user-documentation/system-admin-documentation/ci-cd.md);
  reports land in [QA Reports](../01-product-documentation/03-generated-system-artifacts/quality-assurance-reports.md).
