# Phase 1 Data Model — Walking Skeleton

Phase 0 introduces **no domain data** — the four product contexts are empty skeletons. The "entities"
here are the structural units the phase creates plus the one non-domain status resource.

## Structural units (not persisted domain data)

### Module skeleton
One Spring Modulith `@ApplicationModule` per bounded context. No aggregates, tables, or events yet.

| Module | Package | Owns (later) | Phase 0 state |
|--------|---------|--------------|---------------|
| `identity` | `com.viego.identity` | Explorer, Preferences, Auth | empty skeleton + `api` |
| `exploration` | `com.viego.exploration` | Collection, Province, Ward | empty skeleton + `api` |
| `engagement` | `com.viego.engagement` | Streak, Discovery Ritual | empty skeleton + `api` |
| `content` | `com.viego.content` | Regional Heritage, Cultural Beat, Trivia | empty skeleton + `api` |
| `shared` | `com.viego.shared` | stable value objects only (ids, `LocalizedText`) | thin kernel, no logic |

**Rules (enforced by `verify()`):** each module exposes only its `api` named interface; `domain` is
internal; no cross-module imports; no cross-module FKs/joins; `shared` holds no business logic. Per
[Module Boundary Rules](../../docs/02-process-documentation/sdd-standards/module-boundary-rules.md).

### Database schemas (empty)
Schema-per-module is provisioned via Flyway migration **locations** only; **no tables** exist in
Phase 0. Startup succeeds against an empty migration set (FR-008).

```
db/migration/
├── identity/       (empty)
├── exploration/    (empty)
├── engagement/     (empty)
└── content/        (empty)
```

## Non-domain resource

### Health / Status
The trivial resource the app reads to prove end-to-end connectivity. Not owned by any bounded context;
lives in `com.viego.platform`. Carries **no personal data**.

| Field | Type | Notes |
|-------|------|-------|
| `status` | string enum `UP` / `DOWN` | overall app health |
| `service` | string | constant, e.g. `viego-backend` |
| `version` | string | build/git version |
| `time` | ISO-8601 timestamp | server time of the check |

- **Unauthenticated**, read-only, idempotent.
- Backed by Spring Actuator health for readiness/liveness; the `/api/v1/status` trivial endpoint wraps
  a documented, springdoc-generated response (FR-006, FR-007).
- No state transitions; no persistence.

## Mobile shell state (client-only, ephemeral)

Not backend data — local UI state the shell manages, listed for completeness.

| State | Values | Persistence |
|-------|--------|-------------|
| Active locale | `vi` \| `en` | device (later: server Preferences in P1) |
| Active theme | `light` \| `dark` | device (later: server Preferences in P1) |
| Health-check result | `loading` \| `healthy` \| `error` | in-memory (React Query) |

> In Phase 1 (Identity) locale/theme move to the server-side **Preferences** value object; in Phase 0
> they are device-local placeholders only.
