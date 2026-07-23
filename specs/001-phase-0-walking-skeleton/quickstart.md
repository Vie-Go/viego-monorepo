# Quickstart — Phase 0 Walking Skeleton

Goal: from a fresh checkout, run the backend + app locally and see the app display a **healthy** status
from the backend (the walking-skeleton slice). Target: **≤30 min** (SC-001).

## Prerequisites

- JDK **25**, the **Spring CLI** (to scaffold the backend — [ADR-0009](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0009-spring-boot-4-and-spring-cli-scaffolding.md)), Docker (for local Postgres), Node LTS + npm, and the **Expo/EAS CLI**.
- iOS Simulator (Xcode) and/or Android emulator, or the **Expo Go / dev-build** app on a device.

> **Backend is Spring Boot 4**, scaffolded once via the Spring CLI (`spring boot new`, or `spring init`);
> after that, `./mvnw` drives builds/runs below.

## 1. Backend — run against local Postgres

```bash
cd backend
docker compose up -d          # starts local Postgres (compose.yaml)
./mvnw spring-boot:run        # starts the modular monolith on :8080
```

Verify:

```bash
curl -s http://localhost:8080/api/v1/status         # → {"status":"UP","service":"viego-backend",...}
curl -s http://localhost:8080/actuator/health       # → {"status":"UP"}
open http://localhost:8080/swagger-ui.html          # springdoc UI (getStatus documented)
```

## 2. Verify module boundaries

```bash
cd backend
./mvnw test -Dtest=ModulithVerificationTest         # ApplicationModules.verify() → green
```

Prove the gate bites: temporarily add a cross-module internal import, re-run — the build **fails**.
Revert.

## 3. Mobile — run the app against the local backend

```bash
cd mobile
npm install
npm run start                 # Expo dev server; open on simulator/emulator/device
```

- Set the API base URL to `http://localhost:8080/api/v1` (dev build) — see `mobile/app/shared/api`.
- On launch the shell issues the `getStatus` call and renders **connected/healthy**; kill the backend
  and confirm it shows a graceful **error/retry** state (not a crash).

Exercise the shell:
- Toggle **language** vi ↔ en → placeholder copy switches.
- Toggle **theme** light ↔ dark → UI re-renders in both.
- Navigate the **auth stack** and **tab placeholders** (Map/Collection/Streak/Profile).

## 4. Point the app at dev

Set the API base URL to the **dev** backend (`https://dev.api.viego.example/api/v1`). The app shows the
same healthy status served by the deployed backend — this is the end-to-end slice (US1).

## Definition of done (maps to spec)

| Check | Spec |
|-------|------|
| App shows healthy status from **dev** backend | US1 / SC-002 |
| App handles backend-down gracefully | US1 scenario 2 |
| `verify()` green; fails on a deliberate violation | US2 / SC-004 |
| Backend-only change runs only backend CI; `contracts/**` runs both | US3 / SC-003 |
| Merge to main auto-deploys backend to dev, healthy | US3 / SC-005 |
| Language (vi/en) + theme (light/dark) switch in shell | US4 / SC-006 |
| Container image built; `getStatus` documented; empty Flyway starts clean | US4 |

## CI (path-scoped)

- `.github/workflows/backend.yml` — triggers on `backend/**` + `contracts/**`: build → `verify()` →
  test → scan → image → **deploy dev** on `main`.
- `.github/workflows/mobile.yml` — triggers on `mobile/**` + `contracts/**`: typecheck → lint → test →
  build (EAS).
