---
description: "Task list for Phase 0 — Walking Skeleton"
---

# Tasks: Phase 0 — Walking Skeleton

**Input**: Design documents from `/specs/001-phase-0-walking-skeleton/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/)

**Tests**: This is a foundational/infra phase. The only test tasks included are ones that are
themselves **deliverables** of the phase (the module-boundary `verify()` test and the `/status`
contract test). No broader TDD suite is added — the five product contexts are empty.

**Organization**: Grouped by user story (US1–US4 from spec.md) so each is an independently testable
increment. Path prefixes match the CI path-filters: `backend/**`, `mobile/**`, `contracts/**`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1–US4; Setup/Foundational/Polish carry no story label

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Monorepo skeleton and per-app project initialization.

- [X] T001 Create monorepo top-level structure (`backend/`, `mobile/`, `contracts/`, `.github/workflows/`) per [plan.md](plan.md) structure
- [X] T002 [P] Add root `README.md` (build/run stub, FR-002), `.gitignore`, and `.editorconfig` enforcing **LF** line endings (avoids the CRLF issue seen in `.specify` scripts)
- [X] T003 [P] Seed `contracts/platform.openapi.yaml` from the feature contract in `specs/001-phase-0-walking-skeleton/contracts/platform.openapi.yaml` (establishes the shared contract seam, FR-020)
- [X] T004 [P] Scaffold the backend with the **Spring CLI** (`spring boot new`, or `spring init`) into `backend/` — **Spring Boot 4**, Java 25, dependencies: web, Spring Modulith, springdoc-openapi, Flyway, Actuator, Security, validation, Testcontainers; pin Spring Boot 4 + Java 25 in `backend/pom.xml` (per [ADR-0009](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0009-spring-boot-4-and-spring-cli-scaffolding.md) and [research.md](research.md) R2–R4)
- [X] T005 [P] Initialize mobile Expo + TypeScript app in `mobile/` — `package.json`, `app.json`, `eas.json` (Expo SDK + EAS, per [research.md](research.md) R1)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The minimum runnable backend + mobile both apps' stories build on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T006 Create backend entrypoint `backend/src/main/java/com/viego/VieGoApplication.java` + `backend/src/main/resources/application.yml` (context path `/api/v1`, datasource config)
- [X] T007 [P] Add local Postgres `backend/compose.yaml` (FR-009)
- [X] T008 Wire Flyway with per-module empty locations `backend/src/main/resources/db/migration/{identity,exploration,content,engagement,social}/` so the app boots with zero migrations (FR-008)
- [ ] T009 Verify the backend boots locally against Compose Postgres (`./mvnw spring-boot:run`) — foundational checkpoint · ⏸ **BLOCKED (env): Docker daemon not running in this sandbox.** Code is ready; run `docker compose up -d && ./mvnw spring-boot:run` locally.
- [X] T010 [P] Verify the mobile app bootstraps and renders `mobile/app/App.tsx` via `npm run start` on a simulator/dev build · ✅ scaffold complete, deps installed, `npx tsc --noEmit` green — ⚠ simulator render not run in sandbox (no simulator)
- [X] T011 [P] Add backend `backend/Dockerfile` (or Spring Boot buildpacks config) producing an OCI image (FR-010) — prerequisite for the dev slice (US1) and CI deploy (US3) · ✅ Dockerfile written + deployable jar built (`./mvnw package`); ⚠ `docker build` not run (daemon down)

**Checkpoint**: Both apps run locally; image builds. User stories can now proceed.

---

## Phase 3: User Story 1 — End-to-end vertical slice runs in dev (Priority: P1) 🎯 MVP

**Goal**: The app calls the backend `/status` endpoint and displays a healthy result — proving the whole path end to end.

**Independent Test**: Point the app at the backend, trigger the health/ping call, see a healthy result; kill the backend and see a graceful error/retry (not a crash).

- [X] T012 [P] [US1] Contract test for `GET /api/v1/status` against `contracts/platform.openapi.yaml` in `backend/src/test/java/com/viego/platform/StatusContractTest.java`
- [X] T013 [US1] Implement the status resource `backend/src/main/java/com/viego/platform/StatusController.java` returning `Status {status,service,version,time}` (FR-006, FR-007; [data-model.md](data-model.md))
- [X] T014 [US1] Enable Actuator health and map `/api/v1/status`; annotate for springdoc so it is documented
- [X] T015 [P] [US1] Mobile API client skeleton + `getStatus` call in `mobile/app/shared/api/client.ts` (FR-016)
- [X] T016 [US1] Home/connectivity placeholder screen rendering the healthy result and a graceful error/retry state in `mobile/app/navigation/` (US1 scenarios 1 & 2)
- [X] T017 [US1] API base-URL switch (local/dev) in `mobile/app/shared/api/config.ts`
- [ ] T018 [US1] Deploy the backend image to **dev** and point the app at dev; confirm the app shows healthy from the dev backend (US1 scenario 1, SC-002) — first deploy may be manual, later automated by T024/T026 · ⏸ **BLOCKED (env): no dev environment provisioned.** Local slice is wired end to end (contract test + client + screen).

**Checkpoint**: MVP — the walking skeleton runs end to end. Stop and validate before continuing.

---

## Phase 4: User Story 2 — Module boundaries verified from day one (Priority: P2)

**Goal**: The six modules exist as empty skeletons with `ApplicationModules.verify()` enforcing boundaries on every build.

**Independent Test**: Run the backend build — verification passes with empty modules; introduce a deliberate cross-module violation — the build fails.

- [X] T019 [P] [US2] Create the six module packages with `@ApplicationModule` + `package-info.java` + published `api` named interface: `identity`, `exploration`, `content`, `engagement`, `social`, `shared` under `backend/src/main/java/com/viego/*` (FR-004; [Module Boundary Rules](../../docs/02-process-documentation/sdd-standards/module-boundary-rules.md))
- [X] T020 [US2] Implement `backend/src/test/java/com/viego/ModulithVerificationTest.java` calling `ApplicationModules.of(VieGoApplication.class).verify()` (FR-005)
- [X] T021 [US2] Prove the gate bites: temporarily add a cross-module internal import, confirm the build **fails**, revert; document the check in [quickstart.md](quickstart.md) (US2 scenario 2, SC-004)

**Checkpoint**: Boundary enforcement is live and demonstrably fails on violation.

---

## Phase 5: User Story 3 — Path-scoped CI is green on both sides (Priority: P2)

**Goal**: Both pipelines run, are path-scoped, `contracts/**` triggers both, merge is gated, and merge to main auto-deploys the backend to dev.

**Independent Test**: A backend-only change runs only the backend pipeline; a mobile-only change only the mobile pipeline; a `contracts/**` change runs both; a merge to main deploys to dev.

- [X] T022 [P] [US3] Backend workflow `.github/workflows/backend.yml` — `paths: backend/**, contracts/**`; build → `verify()` → test → scan → image → **deploy dev** on `main` (FR-017, FR-019, FR-021)
- [X] T023 [P] [US3] Mobile workflow `.github/workflows/mobile.yml` — `paths: mobile/**, contracts/**`; typecheck → lint → test → build (EAS) (FR-018, FR-019)
- [ ] T024 [US3] Configure branch protection so merge gates evaluate **only** the pipelines a change triggers (FR-021, FR-022) · ⏸ **BLOCKED (env): requires GitHub repo settings** (done in the hosting platform, not code)
- [ ] T025 [US3] Verify path-scoping across representative changes: backend-only, mobile-only, and `contracts/**` (triggers both) (SC-003) · ⏸ **BLOCKED (env): requires live CI runs.** Workflow `paths:` filters are written to spec.
- [ ] T026 [US3] Verify auto-deploy: a backend change merged to `main` deploys to dev and the health endpoint reports healthy (SC-005, FR-023) · ⏸ **BLOCKED (env): requires live CI + dev env** (see T018)

**Checkpoint**: Sustainable delivery engine trusted and green.

---

## Phase 6: User Story 4 — Foundational app shell & backend conventions (Priority: P3)

**Goal**: The reusable seams every later phase plugs into — app shell (nav, tokens, primitives, i18n, theme) and backend conventions (API docs UI, container image, migration wiring).

**Independent Test**: Launch the app — shell renders, language switches vi/en, theme switches light/dark; build the backend — image is produced and `getStatus` is documented.

- [X] T027 [P] [US4] Design tokens from `DESIGN.md` in `mobile/app/shared/theme/tokens.ts` + light/dark theme provider (FR-013, FR-015)
- [X] T028 [P] [US4] UI primitives Button/Card/Input in `mobile/app/shared/ui/` (FR-013)
- [X] T029 [P] [US4] i18n scaffold (vi/en) + language switch in `mobile/app/shared/i18n/` (FR-014)
- [X] T030 [US4] Navigation shell — `AuthStack` + tab placeholders (Map/Collection/Streak/Profile) in `mobile/app/navigation/` (FR-012)
- [X] T031 [US4] Wire theme + language switch controls into the shell; verify all four combinations render (SC-006)
- [X] T032 [P] [US4] Expose springdoc Swagger UI and the generated OpenAPI; confirm `getStatus` appears (FR-007, US4 scenario 3)
- [ ] T033 [US4] Verify the container image builds and empty-Flyway startup succeeds (US4 scenarios 3 & 4) · ⏸ **BLOCKED (env): needs Docker daemon.** Deployable jar builds; Flyway config + empty per-module locations are in place — runtime startup pending Docker (see T009).

**Checkpoint**: All conventions in place; later phases fill skeletons without restructuring.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T034 [P] Complete root `README.md` build/run instructions for both apps; validate ≤30-min onboarding (FR-002, SC-001)
- [ ] T035 Run [quickstart.md](quickstart.md) end-to-end and confirm every Definition-of-Done row · ⏸ **BLOCKED (env): needs Docker + a simulator.** Backend rows verified (tests, verify()-gate, jar); dev/CI rows pending infra.
- [X] T036 [P] Draft **ADR 0008 — Expo + EAS toolchain** in `docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0008-expo-and-eas-toolchain.md` referencing (not editing) ADR-0003; add it to the decisions `README.md` index and mark the plan's open-decision Resolved (research R1, Constitution V)
- [X] T037 [P] Add dependency + container vulnerability scan config used by the backend pipeline (FR-021)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies — start immediately.
- **Foundational (Phase 2)**: depends on Setup — **blocks all user stories**.
- **User Stories (Phase 3–6)**: all depend on Foundational. Natural priority order P1 → P2 → P2 → P3.
- **Polish (Phase 7)**: depends on the desired stories being complete.

### User Story Dependencies (infra phase — some intentional coupling)

- **US1 (P1)**: after Foundational. T018 (dev slice) integrates with US3's deploy (T024/T026) — the first dev deploy can be manual so US1 is demonstrable without waiting on CI.
- **US2 (P2)**: after Foundational. Independent of US1/US3/US4.
- **US3 (P2)**: after Foundational. `backend.yml` runs US2's `verify()` (T020) as a gate; US2 should land first for a green pipeline.
- **US4 (P3)**: after Foundational. Independent; T032/T033 confirm backend conventions already wired in Foundational/US1.

### Within Each Story

- Contract/verify tests (where present) before the implementation they cover.
- Backend resource before mobile consumption (T013/T014 before T016).
- Story complete before moving to the next priority.

### Parallel Opportunities

- Setup: T002, T003, T004, T005 in parallel.
- Foundational: T007, T010, T011 in parallel (after T006).
- US1: T012 and T015 in parallel; T013/T014 (backend) parallel to T015 (mobile).
- US2: T019 parallelizable across the five packages.
- US3: T022 and T023 in parallel.
- US4: T027, T028, T029, T032 in parallel.
- Polish: T034, T036, T037 in parallel.
- Cross-team: once Foundational is done, Engineer A can take the backend stories (US2/US3 backend) while Engineer B takes the mobile shell (US1 mobile/US4).

---

## Parallel Example: User Story 1

```bash
# Backend and mobile sides of the slice in parallel:
Task: "Contract test for GET /api/v1/status in backend/src/test/java/com/viego/platform/StatusContractTest.java"   # T012
Task: "Mobile API client skeleton + getStatus in mobile/app/shared/api/client.ts"                                  # T015
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 Setup → 2. Phase 2 Foundational → 3. Phase 3 US1 → **STOP & VALIDATE** the walking skeleton (app shows healthy from dev) → demo M0.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. US1 → the walking skeleton (MVP, milestone **M0 Foundations**).
3. US2 → boundary gate live.
4. US3 → path-scoped CI + auto-deploy.
5. US4 → app shell + backend conventions.
6. Polish → README, quickstart validation, ADR 0008, scans.

### Parallel Team Strategy (two engineers, per the plan)

- Both complete Setup + Foundational together.
- Then **Engineer A** (backend scaffold): US2 + US3 backend; **Engineer B** (mobile scaffold): US1 mobile + US4 shell. Integrate on the `/status` contract.

---

## Notes

- [P] = different files, no incomplete-task dependencies.
- Commit after each task or logical group; keep the backend pipeline green (`verify()` must stay passing).
- The exit for this phase is **milestone M0** — skeleton runs in dev, CI green both sides, `verify()` green ([plans-estimates-schedules](../../docs/02-process-documentation/plans-estimates-schedules.md)).
- **Post-P0 stack update**: T030 (navigation shell) and T028 (UI primitives) were built before
  [ADR-0011](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0011-expo-router-zustand-maestro-for-mobile.md)
  (Expo Router, Zustand, Maestro). Checkmarks above reflect what actually shipped in P0 and are left
  as-is; migrating `mobile/app/navigation/` to Expo Router and the UI primitives to `@expo/ui` is
  unstarted follow-up work for a later phase, not retroactively marked done here.
