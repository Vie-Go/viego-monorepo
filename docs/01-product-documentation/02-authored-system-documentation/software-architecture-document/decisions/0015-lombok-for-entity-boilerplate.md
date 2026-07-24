---
title: "ADR 0015 — Lombok for entity and DTO boilerplate"
description: "Generate accessors and builders with Lombok, with an explicit ban on @Data/@EqualsAndHashCode/@ToString on JPA entities."
---

# ADR 0015 — Lombok for entity and DTO boilerplate

- **Status:** Accepted · **Date:** 2026-07-24 · **Deciders:** VieGo team

## Context

The five module schemas ([ADR-0014](0014-uuidv7-primary-keys.md)) are mapped by hand-written JPA
entities. Before any domain behaviour exists, those classes were already ~60% getters, setters and
positional constructors. With five more feature phases of entities ahead of a two-person team,
that boilerplate is pure review surface: it hides the few lines that matter (columns, constraints,
invariants) and positional constructors get silently mis-ordered as fields are added.

## Decision

Use **Lombok** (managed by the Spring Boot parent) to generate accessors and builders.

**The entity pattern is fixed:**

```java
@Entity
@Table(name = "beats", schema = "content")
@Getter
@Setter
@NoArgsConstructor   // required by JPA
@SuperBuilder        // named construction; works across BaseEntity
public class Beat extends BaseEntity { … }
```

- Field initialisers must carry **`@Builder.Default`**, or the builder silently drops them.
- Entities keyed by a natural or foreign key (`Province`, `Preferences`, `Streak`) use
  `@Builder` + `@AllArgsConstructor` instead of `@SuperBuilder`, since they do not extend
  `BaseEntity`.

**Banned on JPA entities — `@Data`, `@EqualsAndHashCode`, `@ToString`.** All three are wrong for
entities, not merely unnecessary:

- `equals`/`hashCode` over *all* fields breaks JPA identity — two rows with equal contents are not
  the same entity, and a transient instance changes its hash once the key is assigned, corrupting
  any `HashSet` it is already in. Entity identity is the **primary key alone**, so `equals` and
  `hashCode` stay hand-written in `BaseEntity` (and in the natural-key entities).
- `toString` over all fields triggers lazy-loading of associations, so a log line can fire
  queries — or throw outside a transaction.

`@Data` implies both, so it is banned outright.

Records remain the default for immutable, non-entity types (domain events, API DTOs, `Status`);
Lombok is for the mutable JPA mapping layer only.

## Build configuration

Lombok is declared `<optional>true</optional>` and **also as an explicit
`<annotationProcessorPaths>` entry** on `maven-compiler-plugin`. The second part is not optional:
**JDK 23+ no longer discovers annotation processors on the compile classpath**, so on
[Java 25](0009-spring-boot-4-and-spring-cli-scaffolding.md) a classpath-only Lombok compiles to
"cannot find symbol: method getId()". A `lombok.config` at the backend root sets
`addLombokGeneratedAnnotation` (keeps generated code out of coverage) and `stopBubbling`.

## Alternatives considered

- **Hand-written accessors.** Rejected: the status quo, and the reason this ADR exists — the
  signal-to-noise ratio in an entity was poor before any real feature was written.
- **Java records for entities.** Not possible: JPA requires a no-arg constructor and mutable
  fields for the persistence context; records are final and immutable.
- **IDE-generated accessors.** Rejected: same volume of code to review and keep in sync, just
  authored faster once.

## Consequences

**Positive**
- Entities shrink to their schema mapping; a field is declared exactly once.
- `@SuperBuilder` gives named construction, so adding a column cannot silently reorder arguments.
- Builders work uniformly across the `BaseEntity` hierarchy.

**Negative / accepted**
- A compile-time dependency on annotation processing; a broken processor path fails with confusing
  "cannot find symbol" errors rather than a direct message (see the JDK 23+ note above).
- Generated methods are invisible in source, so accessor behaviour cannot be customised without
  first removing the annotation for that field.
- `@Builder.Default` is easy to forget and fails silently by dropping the default. New entities
  must be reviewed for it.
