# Feature Specification: Phase 0 — Walking Skeleton

**Feature Branch**: `001-phase-0-walking-skeleton`

**Created**: 2026-07-22

**Status**: Draft

**Input**: User description: "create a new spec for Phase 0 in docs/02-process-documentation/plans-estimates-schedules.md, read related document for more detail before create spec."

**Source**: [Plans, Estimates, Schedules → Phase 0](../../docs/02-process-documentation/plans-estimates-schedules.md) · Milestone **M0 Foundations**.

## User Scenarios & Testing *(mandatory)*

> The "users" of a walking skeleton are the **delivery team** and the **delivery process** itself:
> the two full-stack engineers and the CI/CD pipeline that every later phase (P1–P6) is built on.
> Phase 0 delivers no end-user feature; its value is a proven, verifiable foundation so that the
> first real feature (Phase 1 Identity) can be built contract-first without re-litigating platform
> setup.

### User Story 1 - End-to-end vertical slice runs in dev (Priority: P1)

As an engineer, I can run the mobile app against the **dev** backend and see it successfully call a
trivial backend endpoint (health/ping) and render the result — proving the whole path (app →
network → deployed backend → database wiring → response) is connected end to end.

**Why this priority**: This *is* the walking skeleton. A single thin slice that runs in a real
deployed environment de-risks every integration point at once and is the one thing that, if
delivered alone, proves the foundation works. Everything else in Phase 0 exists to support it.

**Independent Test**: Deploy the backend to dev, open the app pointed at the dev API, trigger the
health/ping call, and confirm a healthy response is displayed. Fully testable without any of the
five product features existing.

**Acceptance Scenarios**:

1. **Given** the backend is deployed to dev and healthy, **When** the app issues its health/ping
   request, **Then** the app displays a healthy/connected result.
2. **Given** the dev backend is unreachable, **When** the app issues its health/ping request,
   **Then** the app shows a graceful error/retry state rather than crashing.
3. **Given** a fresh checkout, **When** an engineer follows the repo README, **Then** both `backend/`
   and `mobile/` build and run locally against a local backend.

---

### User Story 2 - Module boundaries verified from day one (Priority: P2)

As an engineer, I have the five empty bounded-context modules (`identity`, `exploration`,
`content`, `engagement`, `social`) plus a thin `shared` module in place, with automated
**module-boundary verification** running on every backend build — so architectural drift is caught
from the very first commit, not retrofitted later.

**Why this priority**: The modular-monolith extractability guarantee ([architecture principles](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/architecture-principles.md),
[module boundary rules](../../docs/02-process-documentation/sdd-standards/module-boundary-rules.md))
is only cheap if enforced from the start. Wiring the check before any real code exists means every
later phase inherits it for free.

**Independent Test**: Run the backend build; confirm module verification executes and passes with the
empty modules. Introduce a deliberate boundary violation (e.g., a cross-module internal import) and
confirm the build **fails**.

**Acceptance Scenarios**:

1. **Given** the empty modules exist, **When** the backend build runs, **Then** module-boundary
   verification executes and passes.
2. **Given** a deliberate cross-module boundary violation, **When** the backend build runs, **Then**
   the build fails with a boundary-violation error.

---

### User Story 3 - Path-scoped CI is green on both sides (Priority: P2)

As an engineer, both the backend and mobile pipelines run automatically, are **path-scoped** (a
backend-only change does not run the mobile pipeline and vice versa), a **shared-contract** change
triggers both, and merge is gated on these pipelines passing — with a merge to the main line
auto-deploying the backend to dev.

**Why this priority**: Path-scoped CI ([CI/CD](../../docs/01-product-documentation/04-user-documentation/system-admin-documentation/ci-cd.md))
is the delivery engine for the whole two-engineer, contract-first way of working; it must be trusted
before real features land on it. It is P2 (not P1) because the slice can be demonstrated once, but
sustainable delivery needs the pipeline green.

**Independent Test**: Open a backend-only change and confirm only the backend pipeline runs; open a
mobile-only change and confirm only the mobile pipeline runs; open a `contracts/` change and confirm
both run. Merge a backend change to the main line and confirm it deploys to dev.

**Acceptance Scenarios**:

1. **Given** a change touching only backend paths, **When** CI runs, **Then** the backend pipeline
   runs and the mobile pipeline is skipped/not required.
2. **Given** a change touching only mobile paths, **When** CI runs, **Then** the mobile pipeline runs
   and the backend pipeline is skipped/not required.
3. **Given** a change touching shared contract paths, **When** CI runs, **Then** **both** pipelines
   run.
4. **Given** a backend change merged to the main line, **When** the pipeline completes, **Then** the
   backend image is deployed to dev and its health endpoint reports healthy.
5. **Given** any pipeline reports failing tests, a boundary violation, or a high/critical
   vulnerability, **When** a merge is attempted, **Then** the merge is blocked.

---

### User Story 4 - Foundational app shell & backend conventions (Priority: P3)

As an engineer, the app provides a navigation shell (auth stack + tab placeholders), design tokens,
core UI primitives, an i18n scaffold (Vietnamese/English), a theme switch (light/dark), and an API
client skeleton; the backend provides its build, containerization, database-migration wiring, and
auto-generated API documentation — establishing the conventions every later phase plugs into.

**Why this priority**: These are the reusable seams the product features will fill. They add real
value (later phases don't re-solve theming, i18n, navigation, migrations, or API-doc generation) but
are not required to demonstrate the P1 slice, so they are P3.

**Independent Test**: Launch the app and confirm the shell renders, language can switch between VI/EN,
and theme can switch between light/dark. Build the backend and confirm the container image is produced
and API documentation is generated for the trivial endpoint.

**Acceptance Scenarios**:

1. **Given** the app shell, **When** an engineer switches language, **Then** placeholder copy renders
   in Vietnamese and English.
2. **Given** the app shell, **When** an engineer switches theme, **Then** the UI renders in light and
   dark.
3. **Given** the backend build, **When** it completes, **Then** a container image is produced and API
   documentation for the trivial endpoint is generated.
4. **Given** the database-migration tooling is wired with no migrations yet, **When** the backend
   starts, **Then** startup succeeds.

---

### Edge Cases

- **Backend unavailable / slow** when the app pings → graceful error + retry, never a crash (see US1
  scenario 2).
- **Change spanning both apps** (backend *and* mobile paths in one change) → both pipelines run and
  both must pass.
- **Docs-only / non-app change** → neither app pipeline is required as a merge gate.
- **Boundary violation introduced** → backend build fails (see US2 scenario 2).
- **Dev deploy fails the health gate** → rollout does not complete; the previous healthy state
  remains (no half-deployed backend serving the app).
- **Empty migration set** → startup still succeeds with migration tooling wired but no migrations.

## Requirements *(mandatory)*

### Functional Requirements

#### Repository & structure
- **FR-001**: The system MUST be a single monorepo containing separate `backend/` and `mobile/`
  paths plus a shared `contracts/` path, consistent with the
  [monorepo decision](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0006-monorepo-source-control.md).
- **FR-002**: The repository MUST document (README) how to build and run both apps locally from a
  fresh checkout.

#### Backend scaffold
- **FR-003**: The backend MUST build as a single deployable unit (the modular monolith) via its
  build tool.
- **FR-004**: The backend MUST define the six modules — `identity`, `exploration`, `content`,
  `engagement`, `social`, and a thin `shared` — as empty bounded-context skeletons.
- **FR-005**: The backend MUST include an automated **module-boundary verification** test that runs
  on every build and **fails the build** on any boundary violation.
- **FR-006**: The backend MUST expose a **health/ping** endpoint suitable for readiness/liveness
  checks and for the app's connectivity check.
- **FR-007**: The backend MUST expose at least one trivial application endpoint whose **API
  documentation is auto-generated** from the code.
- **FR-008**: The backend MUST wire **database-migration tooling** (per-module migration paths) such
  that startup succeeds with zero migrations present.
- **FR-009**: The backend MUST run locally against a containerized local database (no cloud
  dependency required for local development).
- **FR-010**: The backend MUST be packaged as a **container image** that can be deployed to the dev
  environment.

#### Mobile scaffold
- **FR-011**: The mobile app MUST be a cross-platform (iOS + Android) application scaffold.
- **FR-012**: The mobile app MUST provide a **navigation shell** with an authentication stack and tab
  placeholders (no real auth or features yet).
- **FR-013**: The mobile app MUST apply **design tokens** from the design system and provide core UI
  primitives (at minimum Button, Card, Input).
- **FR-014**: The mobile app MUST provide an **i18n scaffold** supporting **Vietnamese and English**,
  with a switch between them.
- **FR-015**: The mobile app MUST provide a **theme switch** between **light and dark**.
- **FR-016**: The mobile app MUST include an **API client skeleton** and successfully call the dev
  backend's health/ping endpoint, rendering the result and handling failure gracefully.

#### CI/CD & delivery
- **FR-017**: The backend pipeline MUST run build → tests (incl. module-boundary verification) →
  vulnerability scan → image build, and, on merge to the main line, **deploy to dev**.
- **FR-018**: The mobile pipeline MUST run typecheck → lint → tests → build.
- **FR-019**: Both pipelines MUST be **path-scoped**: a change under only one app's path MUST NOT
  trigger the other app's pipeline.
- **FR-020**: A change under the shared `contracts/` path MUST trigger **both** pipelines.
- **FR-021**: Merge MUST be blocked when a triggered pipeline reports failing tests, a module-boundary
  violation, or a high/critical vulnerability.
- **FR-022**: Merge gates MUST evaluate only the pipelines a change actually triggers (a mobile-only
  change is not gated by a backend build that never ran).

#### Environment
- **FR-023**: A **dev** environment MUST exist to which the backend auto-deploys, and against which
  the app's connectivity check runs.

### Key Entities *(include if feature involves data)*

- **Module skeleton**: one of the six Spring-Modulith modules (`identity`, `exploration`, `content`,
  `engagement`, `social`, `shared`). At this phase they carry no domain logic — only the boundary
  each later phase fills. `shared` holds only stable primitives (ids, localized text), never business
  logic.
- **Health/Ping resource**: the trivial, unauthenticated status the app reads to prove end-to-end
  connectivity. Carries no personal data.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new engineer can, from a fresh checkout and following the README only, build and run
  both apps locally within **30 minutes**.
- **SC-002**: On the happy path, the app displays a healthy result from the **dev** backend **100%**
  of the time the backend is healthy (the walking-skeleton slice works end to end).
- **SC-003**: For a backend-only change, the mobile pipeline does not run (and vice versa); for a
  shared-contract change, both pipelines run — verified across representative changes.
- **SC-004**: Introducing a deliberate module-boundary violation causes the backend build to fail
  **every** time; removing it makes the build pass.
- **SC-005**: A change merged to the main line results in the backend being deployed to dev with its
  health endpoint reporting healthy, with **no manual deploy step**.
- **SC-006**: In the app shell, language can be switched between Vietnamese and English and theme
  between light and dark, with placeholder content re-rendering correctly in all four combinations.
- **SC-007**: A backend change that would introduce a high/critical vulnerability or failing test is
  **blocked from merging**.

## Assumptions

- **CI platform**: assumed to be the team's standard hosted CI with path-filter support (the
  [CI/CD doc](../../docs/01-product-documentation/04-user-documentation/system-admin-documentation/ci-cd.md)
  names GitHub Actions, "confirm via ADR"). Choice of provider does not change these requirements.
- **Dev target**: a lightweight managed container platform + managed database is sufficient for dev;
  the production hosting/observability platform is a **Phase 6** decision and is out of scope here.
- **Datasets & design system already exist**: the province datasets and `DESIGN.md` design system are
  available (per the plan's assumptions), so tokens/primitives are ported, not designed from scratch.
- **Branch/trunk strategy**: trunk-based development with short-lived branches (per the plan's "ways
  of working").
- **Redis is out of scope for Phase 0**: the cache/token-rotation store
  ([ADR 0007](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0007-redis-cache-and-token-rotation.md))
  is introduced when its first consumer arrives (Phase 1 token rotation / Phase 2 caching), keeping
  the skeleton to the app + backend + database only.
- **No real authentication or product features**: auth flows, map/places, beat capture, streaks, and
  the social feed are explicitly deferred to Phases 1–5; Phase 0 ships only placeholders.

## Dependencies & Open Decisions

- **Mobile toolchain — Expo + EAS** *(RESOLVED)*: build with Expo (development builds) + EAS Build,
  per [ADR-0008](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0008-expo-and-eas-toolchain.md)
  (refines [ADR-0003](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0003-react-native-for-mobile.md)).
  Rationale in [research.md](research.md) R1. This settles the FR-011/FR-018 dependency.
- **Contract-first**: the OpenAPI/AsyncAPI contracts location (`contracts/`) must be agreed in Phase 0
  because both pipelines key off it (FR-020); the contracts themselves are populated from Phase 1
  onward.
