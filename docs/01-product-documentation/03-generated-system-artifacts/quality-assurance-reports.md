---
title: "Quality Assurance Reports"
description: "Contract-testing results, spec-compliance, and module-boundary verification output."
---

# Quality Assurance Reports

Machine-produced evidence that the implementation matches the specs. Generated per CI run.

| Report | Produced by | Proves |
|--------|-------------|--------|
| **Contract test results** | Provider/consumer tests vs. `rest-api.openapi.yaml` | API matches the OpenAPI contract |
| **BDD / spec-compliance** | Cucumber over the [executable specs](../01-core-specifications/executable-specifications/) | Business rules behave as specified |
| **Module boundary verification** | `ApplicationModules.verify()` | Modulith boundaries intact (extraction-ready) |
| **Event compliance** | Modulith event tests vs. `domain-events.asyncapi.yaml` | Published events match the catalog |
| **Coverage** | Jacoco / coverage tooling | Test coverage thresholds met |

The gates these must pass live in the [Test Strategy](../../02-process-documentation/test-strategy.md)
and [CI/CD](../04-user-documentation/system-admin-documentation/ci-cd.md).

> Placeholder: link the latest CI report artifacts here (or keep them in the CI system and link
> the run). These are outputs, not committed docs.
