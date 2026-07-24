# Data Model: Identity — Live Authentication & Preferences

Phase 1 output for [plan.md](plan.md). Three entities are **already persisted**
([`003-modular-database-schemas`](../003-modular-database-schemas/spec.md)) — this feature adds no
new tables, only the application/service layer in front of them, plus one small column-default
correction (see Explorer Preferences → Migration note) and several **ephemeral, Redis-only**
records that back auth's hot path (never a system of record; Postgres stays authoritative for
everything durable, per [ADR-0007](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0007-redis-cache-and-token-rotation.md)).

## Explorer *(existing table: `identity.explorers`)*

A registered person using VieGo.

| Field | Type | Notes |
|---|---|---|
| `id` | UUIDv7 | PK, app-generated ([`BaseEntity`](../../backend/src/main/java/com/viego/shared/domain/BaseEntity.java)) |
| `handle` | `VARCHAR(32)`, unique | Auto-generated at creation ([research R5](research.md#r5--handle-generation)); not user-editable in this feature |
| `displayName` | `VARCHAR(64)` | From the provider identity (Google profile name; email local-part for Email provider) |
| `avatarUrl` | `TEXT`, nullable | From the provider identity when available (Google); null for Email |
| `status` | `VARCHAR(16)` | `ACTIVE` at creation; no other value is written by this feature |
| `createdAt` / `updatedAt` | `TIMESTAMPTZ` | Set at creation; `updatedAt` unchanged by this feature (no explorer-level mutation besides preferences, which live on a separate row) |

**Invariants** (already enforced by [FR-002/FR-003](spec.md#functional-requirements)):
- Exactly one `Explorer` row is ever created per identity — a repeat sign-in authenticates, it
  never inserts a second row.
- `handle` is unique (DB `UNIQUE` constraint is the backstop; application-level generation avoids
  ever hitting it).

**Not modeled here** (explicitly out of scope, per [spec.md Assumptions](spec.md#assumptions)):
custom/editable handles, account linking across providers (each provider identity → its own
`Explorer` row until a future decision), Facebook/Zalo as a populated `providerKind`.

## Auth Provider *(existing table: `identity.auth_providers`)*

The binding between an `Explorer` and one external identity that lets them prove who they are on a
future sign-in.

| Field | Type | Notes |
|---|---|---|
| `id` | UUIDv7 | PK |
| `explorerId` | UUID | Logical FK → `identity.explorers.id` (no DB FK across... — this one *is* same-schema, so the existing `ON DELETE CASCADE` FK stands; it's cross-**module** FKs that are prohibited) |
| `providerKind` | `VARCHAR(16)` | `email` \| `google` at this feature (`facebook`/`zalo` values are not written — [R11](research.md#r11--facebookzalo-at-the-contract-layer)) |
| `providerSubjectId` | `VARCHAR(128)` | **Google**: the verified ID token's `sub` claim. **Email**: the normalized (lowercased, trimmed) email address itself — there's no external subject id for a code-based flow, so the email *is* the durable identity key. |
| `createdAt` | `TIMESTAMPTZ` | Set once, at link creation |

**Invariants**: `(providerKind, providerSubjectId)` is unique (existing DB constraint) — this is
the row a sign-in looks up to decide "authenticate existing" vs. "register new" (FR-001/FR-002).
Never carries a password or any provider credential material beyond the subject reference.

## Preferences *(existing table: `identity.preferences`)*

An Explorer's language and theme choice. Exactly one row per Explorer (`explorerId` is both PK and
the only key).

| Field | Type | Notes |
|---|---|---|
| `explorerId` | UUID | PK = owning Explorer's id (owner-keyed entity, no separate surrogate key) |
| `language` | `VARCHAR(8)` | One of `vi\|en\|ko\|ja\|fr` (OpenAPI `Preferences.language` enum); default `vi` |
| `theme` | `VARCHAR(8)` | One of `light\|dark` **only** — see the drift note below |
| `updatedAt` | `TIMESTAMPTZ` | Bumped on every `PUT` |

**Migration needed**: [`Preferences.java`](../../backend/src/main/java/com/viego/identity/domain/Preferences.java)
and the `V1__init_identity_schema.sql` column both currently default `theme` to `"system"`, a value
no spec (OpenAPI, AsyncAPI, or the identity design doc) documents — see
[research R8](research.md#r8--theme-preference-values-reconciling-a-real-doccode-drift`) for why
that's a drift, not an intentional third state. This feature ships a **new** migration,
`V2__preferences_theme_default.sql`, altering the column default from `'system'` to `'light'`, and
updates the entity's `@Builder.Default` to match — `V1` itself is not edited (Flyway migrations
are append-only, same immutability discipline as ADRs).

**Invariants**: Created with sensible defaults (`vi`/`light`) in the **same transaction** as the
owning `Explorer` (FR-010 — a brand-new Explorer has a defined preference from creation, never a
missing row). Replaced wholesale on update (value object semantics — no partial-field `PATCH`).

## Registration/Preference Record *(event — not a table)*

Two append-only domain events, published via Spring Modulith's JPA-backed event publication
registry ([research R1](research.md#r1--session-token-issuance--verification); same
transaction as the state change, matching the pattern already established by
[`NotificationService.raise`](../../backend/src/main/java/com/viego/notification/service/NotificationService.java)).
Defined as Java `record`s under `identity.api` (the module's published named interface — see
[`identity/api/package-info.java`](../../backend/src/main/java/com/viego/identity/api/package-info.java)),
matching [`domain-events.asyncapi.yaml`](../../docs/01-product-documentation/01-core-specifications/api-system-specifications/domain-events.asyncapi.yaml)
exactly:

```java
public record ExplorerRegistered(UUID explorerId, String handle, Instant at) implements Serializable {}

public record PreferencesUpdated(UUID explorerId, String language, String theme, Instant at) implements Serializable {}
```

- `ExplorerRegistered` publishes **exactly once** per Explorer, at creation — never on a repeat
  sign-in (FR-006).
- `PreferencesUpdated` publishes on every successful preference change (FR-009), and is also what
  [ADR-0007](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0007-redis-cache-and-token-rotation.md)'s
  cache-invalidation design names as the trigger to evict a cached `me` read model (no cache exists
  yet at this feature — noted for the module that adds one).

## Ephemeral records (Redis only — never the system of record)

These back the session/auth hot path described in
[research R3/R4](research.md#r3--email-sign-in-without-a-password); none are JPA entities, none
are ever queried as a source of truth, and losing one degrades a single in-flight
flow (a code expires, a session has to fully re-authenticate) rather than corrupting durable state.

| Record | Key | Value / TTL | Purpose |
|---|---|---|---|
| Email challenge | `identity:otp:{normalizedEmail}` | 6-digit code + attempt count; short TTL (minutes) | Backs `POST /auth/email/challenge` → verified on `POST /auth/{provider}` (R3) |
| Refresh-token family | `identity:refresh:{familyId}` | current rotation handle + `explorerId`; no eviction (durability > memory pressure, per ADR-0007) | Rotation + reuse detection (FR-013) |
| Revoked access token | `identity:revoked:{jti}` | presence only; TTL = remaining access-token lifetime | Immediate access-token revocation on logout/reuse-detected event |
| Rate-limit counter | `identity:ratelimit:{ip}:{route}` | integer count; fixed-window TTL | Throttles `/auth/*` (FR-016) |

## Entity relationship (durable data only)

```
Explorer (1) ──── (1) Preferences        [PK(Preferences) = FK = Explorer.id]
Explorer (1) ──── (N) AuthProvider       [AuthProvider.explorerId → Explorer.id]
```

No relationship crosses a module/schema boundary — every other module (`exploration`, `content`,
`engagement`, `social`, `notification`) that needs to know an Explorer exists learns it from
`ExplorerRegistered`, never from a join into `identity.*` (Module Boundary Rules — "own your data",
already enforced by `ApplicationModules.verify()`).
