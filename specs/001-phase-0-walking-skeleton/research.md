# Phase 0 Research — Walking Skeleton

Resolves the spec's open decision and records the platform choices the skeleton commits to. Each item
follows **Decision · Rationale · Alternatives considered**.

## R1. Mobile toolchain — Expo + EAS *(resolves the spec's NEEDS CLARIFICATION)*

**Decision**: Build the mobile app with **Expo** (using **development builds** / config plugins so
any native module is available) and **EAS Build** for CI/store binaries. Not the "managed vs. bare"
dichotomy of old — modern Expo with dev builds gives full native access without ejecting.

**Rationale**:
- The [plan's stack table](../../docs/02-process-documentation/plans-estimates-schedules.md) already
  references **"npm/EAS"**, signalling an Expo/EAS direction.
- Greenfield app, **two full-stack engineers**: Expo removes most native build/signing toil, which is
  the highest-friction part of a bare RN setup for a small team — directly serving **SC-001** (≤30 min
  onboarding) and the "two-person bus factor" risk.
- EAS covers the mobile pipeline's build/E2E/store steps ([CI/CD](../../docs/01-product-documentation/04-user-documentation/system-admin-documentation/ci-cd.md))
  and OTA updates, aligning with [deployment.md](../../docs/01-product-documentation/04-user-documentation/system-admin-documentation/deployment.md)'s
  "consider OTA for JS-only fixes."
- Config plugins / dev builds mean the later map SVG work (P2) and secure token storage (P1) are not
  blocked by the managed runtime.

**Alternatives considered**:
- **Bare React Native (no Expo)** — maximum native control, but the team owns all iOS/Android build
  config and CI signing; slowest to stand up, highest maintenance for a 2-person team. Rejected for P0.
- **Expo strictly managed (no dev builds)** — simplest, but risks hitting a native-module wall later
  (map performance work, secure storage). Rejected in favour of dev builds which keep the escape hatch
  open with no upfront cost.

**Follow-up**: record as **ADR 0008 — Expo + EAS for the React Native toolchain**, referencing (not
editing) [ADR-0003](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0003-react-native-for-mobile.md)
per Constitution Principle V. Update the plan's open-decision row to Resolved.

## R2. Module-boundary enforcement — Spring Modulith `verify()` from day one

**Decision**: A single `ModulithVerificationTest` calling `ApplicationModules.of(VieGoApplication.class).verify()`
runs in the backend test suite; six modules (`identity`, `exploration`, `content`, `engagement`,
`social`, `shared`) exist as empty `@ApplicationModule` packages with a published `api` named
interface each.

**Rationale**: The [Module Boundary Rules](../../docs/02-process-documentation/sdd-standards/module-boundary-rules.md)
and [architecture principles](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/architecture-principles.md)
require `verify()` green in CI; wiring it against empty modules makes every later phase inherit the gate
for free and proves the gate *fails* on a deliberate violation (US2 scenario 2).

**Alternatives considered**: ArchUnit-only rules (more boilerplate, less Modulith-aware); deferring the
check until real modules exist (rejected — retrofitting boundaries is the exact decay the principle
prevents).

## R3. API documentation — springdoc-openapi

**Decision**: Use **springdoc-openapi** to auto-generate the OpenAPI document for the trivial endpoint;
the hand-authored contract lives in `contracts/platform.openapi.yaml` and the generated doc is verified
against it in CI later.

**Rationale**: Matches the [CI/CD](../../docs/01-product-documentation/04-user-documentation/system-admin-documentation/ci-cd.md)
"generate artifacts (Redoc/AsyncAPI…)" step and the [generated artifacts](../../docs/01-product-documentation/03-generated-system-artifacts/)
approach; establishes the contract-first seam (Constitution I) with a non-domain endpoint.

**Alternatives considered**: hand-maintained OpenAPI only (drifts from code); no docs in P0 (fails FR-007).

## R4. Local datastore & migrations — Docker Compose Postgres + Flyway (empty)

**Decision**: `compose.yaml` runs Postgres locally; Flyway is configured with per-module migration
locations (`db/migration/{identity,exploration,content,engagement,social}`) containing **no migrations yet**;
the app starts cleanly with an empty migration set.

**Rationale**: [ADR-0005](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0005-postgresql-and-event-driven-integration.md)
+ [infrastructure](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/infrastructure.md);
proves the migration path wiring (FR-008) before any schema exists. **Redis is deliberately excluded**
(ADR 0007 — no consumer until P1/P2).

**Alternatives considered**: embedded H2 (diverges from prod Postgres — rejected); Liquibase (Flyway
already chosen in ADR-0005).

## R5. CI — GitHub Actions with `paths:` filters

**Decision**: Two workflows, `backend.yml` and `mobile.yml`, each gated by `paths:` — `backend/**` +
`contracts/**` for backend, `mobile/**` + `contracts/**` for mobile. Merge gates evaluate only the
pipelines a change triggers.

**Rationale**: Directly implements the [CI/CD path-based triggers](../../docs/01-product-documentation/04-user-documentation/system-admin-documentation/ci-cd.md);
`contracts/**` as the shared trigger is the deliberate exception (FR-020).

**Alternatives considered**: a single monolithic workflow (can't cleanly path-scope merge gates —
rejected); per-app repos (contradicts [ADR-0006](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0006-monorepo-source-control.md)).

**Open (non-blocking)**: the CI provider is assumed GitHub Actions ("confirm via ADR" in the CI/CD
doc). Provider choice does not change any FR; if it changes, only workflow syntax changes.

## Resolved unknowns summary

| Spec marker / unknown | Resolution |
|-----------------------|------------|
| Mobile toolchain (Expo vs. bare RN) | **Expo + EAS with dev builds** (R1) → ADR 0008 |
| API-doc generation mechanism | springdoc-openapi (R3) |
| Local DB + migration wiring | Docker Compose Postgres + empty Flyway (R4) |
| CI path-scoping mechanism | GitHub Actions `paths:` filters (R5) |

All spec `[NEEDS CLARIFICATION]` markers are now resolved.

## Post-P0 addendum

Routing, client-state, and E2E-tool choices were left implicit when this research was authored
(the skeleton was built with hand-wired `@react-navigation/*` navigators and no E2E). They are now
settled by [ADR-0011](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0011-expo-router-zustand-maestro-for-mobile.md):
**Expo Router** for navigation, **Zustand** for client state, **Maestro** (not Detox) for E2E. See
[plan.md](plan.md)'s Technical Context and [`mobile/CLAUDE.md`](../../mobile/CLAUDE.md) for the
resulting engineering rules. The existing `mobile/app/navigation/` code and UI primitives predate
this decision and are migration candidates, not yet migrated.
