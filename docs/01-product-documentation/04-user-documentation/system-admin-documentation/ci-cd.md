---
title: "CI/CD"
description: "Build, test, and delivery pipelines for backend and mobile."
---

# CI/CD

Assumed platform: GitHub Actions (confirm via ADR). Backend and mobile live in **one monorepo**
([ADR-0006](../../02-authored-system-documentation/software-architecture-document/decisions/0006-monorepo-source-control.md)),
so both pipelines run from the same repository but are **path-scoped** — each is triggered only by
changes under its own path.

## Path-based triggers

| Pipeline | Runs when a PR/push touches | Skipped when only… |
|----------|-----------------------------|--------------------|
| **Backend** | `backend/**`, `contracts/**`, or root/CI config | mobile-only changes |
| **Mobile** | `mobile/**`, `contracts/**`, or root/CI config | backend-only changes |

- A **frontend-only change does not trigger the backend build**, and a backend-only change does
  not trigger the mobile build — each app builds and deploys on its own cadence.
- **`contracts/**` (OpenAPI/AsyncAPI) is shared**: a contract change triggers **both** pipelines,
  since it can break either side. This is the deliberate exception to the isolation above.
- Implemented with GitHub Actions `paths:` filters (or an equivalent path-filter job that gates
  each pipeline). Keep the filters in sync with the repo layout in ADR-0006.

> Merge gates evaluate only the pipelines that a change actually triggers — a mobile-only PR is
> blocked by the mobile gates, not by a backend build that never ran.

## Backend pipeline (PR + `main`) — path: `backend/**` + `contracts/**`
1. Build with Maven.
2. **Module boundary check** — `ApplicationModules.verify()` (fails on violation).
3. Unit + `@ApplicationModuleTest` + slice tests (Testcontainers Postgres).
4. **Contract & BDD** tests vs. the [Core Specifications](../../01-core-specifications/).
5. Static analysis; dependency & container vulnerability scan.
6. Generate artifacts: Redoc/AsyncAPI, TS client, Modulith diagrams
   ([generated artifacts](../../03-generated-system-artifacts/)).
7. Build OCI image; push to registry. On `main`: deploy to **dev**; tags promote to staging/prod.

## Mobile pipeline (PR + release) — path: `mobile/**` + `contracts/**`
1. Install, typecheck, lint.
2. Jest unit + component tests.
3. Build iOS + Android (EAS/Fastlane).
4. E2E (Maestro) on simulators.
5. Release: TestFlight / Play internal → beta → production.

## Quality gates (block merge)
- Module verification passes.
- All test suites green; contract tests match the OpenAPI/AsyncAPI specs.
- OpenAPI contract change reviewed (FE/BE).
- No high/critical vulnerabilities.

Full gate list: [Test Strategy](../../../02-process-documentation/test-strategy.md) and
[Release Checklist](../../../02-process-documentation/release-checklist.md).
