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

## 3. Hybrid Primary Key JPA Entity Mapping Example

### TSID (64-bit `BIGINT`) Entity Example (`content.beats`)
```java
@Entity
@Table(name = "beats", schema = "content")
@Getter
@Setter
public class Beat {

    @Id
    @Tsid  // Hyperscale 64-bit TSID (8 bytes)
    private Long id;

    @Column(name = "explorer_id", nullable = false)
    private UUID explorerId; // Logical reference to identity.explorers(id)

    @Column(name = "place_id", nullable = false)
    private Long placeId; // Logical reference to exploration.places(id)

    @Column(name = "media_url", nullable = false)
    private String mediaUrl;

    @Column(name = "captured_at", nullable = false)
    private Instant capturedAt;
}
```

### Security UUIDv7 Entity Example (`identity.explorers`)
```java
@Entity
@Table(name = "explorers", schema = "identity")
@Getter
@Setter
public class Explorer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id; // Security 128-bit UUID (16 bytes)

    @Column(name = "handle", nullable = false, unique = true)
    private String handle;

    @Column(name = "display_name", nullable = false)
    private String displayName;
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
