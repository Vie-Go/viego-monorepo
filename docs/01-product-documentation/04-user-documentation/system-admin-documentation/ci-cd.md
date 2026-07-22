---
title: "CI/CD"
description: "Build, test, and delivery pipelines for backend and mobile."
---

# CI/CD

Assumed platform: GitHub Actions (confirm via ADR). Two pipelines.

## Backend pipeline (PR + `main`)
1. Build with Gradle.
2. **Module boundary check** — `ApplicationModules.verify()` (fails on violation).
3. Unit + `@ApplicationModuleTest` + slice tests (Testcontainers Postgres).
4. **Contract & BDD** tests vs. the [Core Specifications](../../01-core-specifications/).
5. Static analysis; dependency & container vulnerability scan.
6. Generate artifacts: Redoc/AsyncAPI, TS client, Modulith diagrams
   ([generated artifacts](../../03-generated-system-artifacts/)).
7. Build OCI image; push to registry. On `main`: deploy to **dev**; tags promote to staging/prod.

## Mobile pipeline (PR + release)
1. Install, typecheck, lint.
2. Jest unit + component tests.
3. Build iOS + Android (EAS/Fastlane).
4. E2E (Detox/Maestro) on simulators.
5. Release: TestFlight / Play internal → beta → production.

## Quality gates (block merge)
- Module verification passes.
- All test suites green; contract tests match the OpenAPI/AsyncAPI specs.
- OpenAPI contract change reviewed (FE/BE).
- No high/critical vulnerabilities.

Full gate list: [Test Strategy](../../../02-process-documentation/test-strategy.md) and
[Release Checklist](../../../02-process-documentation/release-checklist.md).
