# Quickstart: Modular Database Schemas Setup & Verification

**Feature**: Modular Database Schemas per Backend Context
**Branch**: `003-modular-database-schemas`
**Date**: 2026-07-23

## Prerequisites
- PostgreSQL 16+ with PostGIS extension installed
- Java 25 & Maven / Gradle

---

## 1. Local Database Initialization

Run PostgreSQL and initialize the 5 domain schemas and PostGIS extension:

```sql
-- Create PostgreSQL database
CREATE DATABASE viego;

\c viego;

-- Enable spatial extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create domain schemas
CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS exploration;
CREATE SCHEMA IF NOT EXISTS content;
CREATE SCHEMA IF NOT EXISTS engagement;
CREATE SCHEMA IF NOT EXISTS social;
```

---

## 2. Separate 5 Flyway Migration Beans Configuration

To ensure migration history is isolated per schema namespace, define 5 separate `@Bean` instances in Spring configuration:

```java
@Configuration
public class FlywayConfig {

    @Bean
    public Flyway identityFlyway(DataSource dataSource) {
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .schemas("identity")
                .defaultSchema("identity")
                .locations("classpath:db/migration/identity")
                .table("flyway_schema_history")
                .load();
        flyway.migrate();
        return flyway;
    }

    @Bean
    public Flyway explorationFlyway(DataSource dataSource) {
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .schemas("exploration")
                .defaultSchema("exploration")
                .locations("classpath:db/migration/exploration")
                .table("flyway_schema_history")
                .load();
        flyway.migrate();
        return flyway;
    }

    @Bean
    public Flyway contentFlyway(DataSource dataSource) {
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .schemas("content")
                .defaultSchema("content")
                .locations("classpath:db/migration/content")
                .table("flyway_schema_history")
                .load();
        flyway.migrate();
        return flyway;
    }

    @Bean
    public Flyway engagementFlyway(DataSource dataSource) {
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .schemas("engagement")
                .defaultSchema("engagement")
                .locations("classpath:db/migration/engagement")
                .table("flyway_schema_history")
                .load();
        flyway.migrate();
        return flyway;
    }

    @Bean
    public Flyway socialFlyway(DataSource dataSource) {
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .schemas("social")
                .defaultSchema("social")
                .locations("classpath:db/migration/social")
                .table("flyway_schema_history")
                .load();
        flyway.migrate();
        return flyway;
    }
}
```

---

## 3. Primary Key JPA Entity Mapping

Key generation is defined **once**, in the shared base class. Nothing else declares an `@Id`
unless it uses a natural key. See
[ADR-0014](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0014-uuidv7-primary-keys.md)
for why UUIDv7, and [ADR-0015](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0015-lombok-for-entity-boilerplate.md)
for the Lombok pattern.

### The shared base class (`shared/domain/BaseEntity.java`)
```java
@MappedSuperclass
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public abstract class BaseEntity implements Serializable {

    @Id
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    // equals/hashCode are hand-written on the primary key alone — never @EqualsAndHashCode.
}
```

### A module entity (`content.beats`)
```java
@Entity
@Table(name = "beats", schema = "content")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class Beat extends BaseEntity {

    @Column(name = "explorer_id", nullable = false)
    private UUID explorerId; // Logical reference to identity.explorers(id)

    @Column(name = "place_id", nullable = false)
    private UUID placeId; // Logical reference to exploration.places(id)

    @Column(name = "media_url", nullable = false)
    private String mediaUrl;

    @Builder.Default  // without this, Lombok's builder drops the initialiser
    @Column(name = "captured_at", nullable = false, updatable = false)
    private Instant capturedAt = Instant.now();
}
```

### A natural-key entity (`exploration.provinces`)
Reference data keeps its external identifier and does **not** extend `BaseEntity`:
```java
@Entity
@Table(name = "provinces", schema = "exploration")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Province implements Serializable {

    @Id
    @Column(name = "id", length = 16)
    private String id; // ISO code, e.g. VN-HN
}
```

---

## 4. Verifying Schema Isolation & Migration History

Execute SQL query in PostgreSQL to confirm 5 separate `flyway_schema_history` tables exist in their respective schemas:

```sql
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_name = 'flyway_schema_history';
/* Expected Result:
 identity    | flyway_schema_history
 exploration | flyway_schema_history
 content     | flyway_schema_history
 engagement  | flyway_schema_history
 social      | flyway_schema_history
*/
```
