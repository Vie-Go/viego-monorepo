# Data Model: Modular Database Schemas per Backend Context

**Feature**: Modular Database Schemas per Backend Context
**Branch**: `003-modular-database-schemas`
**Date**: 2026-07-23

## Database Schema & Primary Key Strategy Overview

The database structure is partitioned into 5 independent PostgreSQL schemas corresponding to VieGo's bounded contexts:
1. `identity` (Core Security & Accounts)
2. `exploration` (Geography & Unlocks) — natural **ISO codes** for provinces/wards
3. `content` (Captures & Reviews)
4. `engagement` (Streaks & Notifications)
5. `social` (Feeds & Reactions)

**Every generated primary key is a UUIDv7** (RFC 9562), assigned by the application via
`BaseEntity` — time-ordered for index locality, unguessable, and identical in every schema.
See [ADR-0014](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0014-uuidv7-primary-keys.md).
Natural keys are kept where they already exist (`exploration.provinces`, `exploration.wards`), and
entities whose identity *is* another entity's key (`identity.preferences`, `engagement.streaks`)
keep `explorer_id` as their primary key.

> [!IMPORTANT]
> **No Foreign Keys Across Schemas**: Foreign key constraints MUST NOT cross schema boundaries. All references across schemas (e.g. `explorer_id` in `content.beats`) are raw logical ID columns enforced at the application level.

---

## 1. `identity` Schema

### `identity.explorers`
Main Explorer account record.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Unique Explorer identifier (UUIDv7) |
| `handle` | `VARCHAR(32)` | `NOT NULL, UNIQUE` | Explorer handle (e.g. `@minh.dq`) |
| `display_name` | `VARCHAR(64)` | `NOT NULL` | Display name |
| `avatar_url` | `TEXT` | `NULL` | Profile avatar URL |
| `status` | `VARCHAR(16)` | `NOT NULL` | Account status (`ACTIVE`, `SUSPENDED`, `DELETED`) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | Registration timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL` | Last profile update timestamp |

### `identity.auth_providers`
Authentication provider bindings for Explorers.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Unique auth binding identifier |
| `explorer_id` | `UUID` | `NOT NULL, FK -> identity.explorers(id)` | Owning explorer |
| `provider_kind` | `VARCHAR(16)` | `NOT NULL` | Provider type (`EMAIL`, `GOOGLE`, `FACEBOOK`, `ZALO`) |
| `provider_subject_id` | `VARCHAR(128)` | `NOT NULL` | Unique subject/ID from auth provider |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | Binding creation timestamp |

*Index*: `UNIQUE (provider_kind, provider_subject_id)`

### `identity.preferences`
Explorer configuration preferences.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `explorer_id` | `UUID` | `PRIMARY KEY, FK -> identity.explorers(id)` | Owning explorer |
| `language` | `VARCHAR(8)` | `NOT NULL` | Preferred language code (`vi`, `en`) |
| `theme` | `VARCHAR(8)` | `NOT NULL` | Preferred UI theme (`light`, `dark`, `system`) |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL` | Preference update timestamp |

---

## 2. `exploration` Schema (natural ISO keys for provinces/wards)

### `exploration.provinces`
Administrative province data.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(16)` | `PRIMARY KEY` | Province ISO code (e.g., `VN-HN`, `VN-SG`) |
| `name_vi` | `VARCHAR(128)` | `NOT NULL` | Vietnamese name |
| `name_en` | `VARCHAR(128)` | `NOT NULL` | English name |
| `geometry` | `GEOMETRY(MultiPolygon, 4326)` | `NOT NULL` | PostGIS boundary geometry |
| `beat_count` | `BIGINT` | `NOT NULL DEFAULT 0` | Total public beats captured in province |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | Record creation timestamp |

### `exploration.wards`
Sub-division of a Province.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(16)` | `PRIMARY KEY` | Ward code |
| `province_id` | `VARCHAR(16)` | `NOT NULL, FK -> exploration.provinces(id)` | Parent province |
| `name_vi` | `VARCHAR(128)` | `NOT NULL` | Vietnamese name |
| `name_en` | `VARCHAR(128)` | `NOT NULL` | English name |
| `geometry` | `GEOMETRY(MultiPolygon, 4326)` | `NOT NULL` | Ward boundary geometry |

### `exploration.places`
Points of Interest (POIs).

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Place identifier (UUIDv7) |
| `province_id` | `VARCHAR(16)` | `NOT NULL, FK -> exploration.provinces(id)` | Province code |
| `ward_id` | `VARCHAR(16)` | `NULL, FK -> exploration.wards(id)` | Ward code |
| `name` | `VARCHAR(128)` | `NOT NULL` | Place name |
| `category` | `VARCHAR(32)` | `NOT NULL` | Category (`COFFEE`, `FOOD`, `HERITAGE`, `NATURE`, `NIGHTLIFE`, `HIDDEN`) |
| `coordinates` | `GEOMETRY(Point, 4326)` | `NOT NULL` | Spatial location |
| `description_vi` | `TEXT` | `NULL` | Vietnamese description |
| `description_en` | `TEXT` | `NULL` | English description |
| `rating` | `NUMERIC(3,2)` | `NOT NULL DEFAULT 0.00` | Aggregate rating |

### `exploration.collections`
Unlocked provinces per Explorer (No foreign key to `identity.explorers`).

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Collection entry identifier (UUIDv7) |
| `explorer_id` | `UUID` | `NOT NULL` | Logical reference to `identity.explorers(id)` |
| `province_id` | `VARCHAR(16)` | `NOT NULL, FK -> exploration.provinces(id)` | Unlocked province |
| `unlocked_at` | `TIMESTAMPTZ` | `NOT NULL` | Timestamp of first Beat capture in province |
| `first_beat_id` | `UUID` | `NOT NULL` | Logical reference to `content.beats(id)` |

*Index*: `UNIQUE (explorer_id, province_id)`

---

## 3. `content` Schema

### `content.beats`
High-frequency photo check-in captures.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Beat identifier (UUIDv7) |
| `explorer_id` | `UUID` | `NOT NULL` | Logical reference to `identity.explorers(id)` |
| `place_id` | `UUID` | `NOT NULL` | Logical reference to `exploration.places(id)` |
| `province_id` | `VARCHAR(16)` | `NOT NULL` | Logical reference to `exploration.provinces(id)` |
| `media_url` | `TEXT` | `NOT NULL` | Photo media storage URL |
| `caption` | `TEXT` | `NULL` | Optional caption |
| `audience` | `VARCHAR(16)` | `NOT NULL` | Audience scope (`FRIENDS`, `PUBLIC`) |
| `captured_at` | `TIMESTAMPTZ` | `NOT NULL` | Capture timestamp |
| `coordinates` | `GEOMETRY(Point, 4326)` | `NOT NULL` | Exact photo coordinates |

### `content.reviews`
Short traveler notes for places.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Review identifier (UUIDv7) |
| `explorer_id` | `UUID` | `NOT NULL` | Logical reference to `identity.explorers(id)` |
| `place_id` | `UUID` | `NOT NULL` | Logical reference to `exploration.places(id)` |
| `beat_id` | `UUID` | `NOT NULL, FK -> content.beats(id)` | Associated verified Beat |
| `rating` | `SMALLINT` | `NOT NULL` | Rating score (1-5) |
| `comment` | `TEXT` | `NOT NULL` | Review comment |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | Review timestamp |

---

## 4. `engagement` Schema

### `engagement.streaks`
Active capture streak per Explorer.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `explorer_id` | `UUID` | `PRIMARY KEY` | Logical reference to `identity.explorers(id)` |
| `current_streak` | `INT` | `NOT NULL DEFAULT 0` | Consecutive days with active capture |
| `longest_streak` | `INT` | `NOT NULL DEFAULT 0` | Highest streak count achieved |
| `last_capture_date` | `DATE` | `NULL` | Calendar date of last qualifying capture |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL` | Last streak evaluation timestamp |

### `engagement.milestones`
Streak and exploration badges unlocked.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Milestone entry identifier (UUIDv7) |
| `explorer_id` | `UUID` | `NOT NULL` | Logical reference to `identity.explorers(id)` |
| `badge_code` | `VARCHAR(32)` | `NOT NULL` | Badge identifier (e.g. `STREAK_7_DAYS`) |
| `unlocked_at` | `TIMESTAMPTZ` | `NOT NULL` | Milestone achievement timestamp |

> **Moved out (post-spec).** Notifications were originally modelled in `engagement`. They now live
> in their own `notification` schema/module — see
> [notification design](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/design/notification.md).
> The `engagement` schema no longer contains a `notifications` table.

---

## 5. `social` Schema

### `social.friendships`
Mutual connections between Explorers.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Friendship identifier (UUIDv7) |
| `explorer_id` | `UUID` | `NOT NULL` | First Explorer UUID |
| `friend_id` | `UUID` | `NOT NULL` | Second Explorer UUID |
| `established_at` | `TIMESTAMPTZ` | `NOT NULL` | Friendship establishment timestamp |

*Index*: `UNIQUE (explorer_id, friend_id)`

### `social.feed_entries`
High-volume fan-out timeline feed entries.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Feed item identifier (UUIDv7) |
| `subscriber_id` | `UUID` | `NOT NULL` | Logical reference to recipient Explorer UUID |
| `beat_id` | `UUID` | `NOT NULL` | Logical reference to `content.beats(id)` |
| `author_id` | `UUID` | `NOT NULL` | Logical reference to author Explorer UUID |
| `feed_type` | `VARCHAR(16)` | `NOT NULL` | Feed context (`FRIEND_FEED`, `DISCOVER`) |
| `published_at` | `TIMESTAMPTZ` | `NOT NULL` | Beat creation timestamp |

*Index*: `INDEX (subscriber_id, feed_type, published_at DESC)`

### `social.reactions`
High-volume social reactions to Beats.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Reaction identifier (UUIDv7) |
| `beat_id` | `UUID` | `NOT NULL` | Logical reference to `content.beats(id)` |
| `explorer_id` | `UUID` | `NOT NULL` | Logical reference to `identity.explorers(id)` |
| `kind` | `VARCHAR(16)` | `NOT NULL` | Reaction type (`HEART`, `BOLT`) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | Reaction timestamp |

*Index*: `UNIQUE (beat_id, explorer_id, kind)`
