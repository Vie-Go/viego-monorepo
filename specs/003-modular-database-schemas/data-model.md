# Data Model: Modular Database Schemas per Backend Context

**Feature**: Modular Database Schemas per Backend Context
**Branch**: `003-modular-database-schemas`
**Date**: 2026-07-23

## Database Schema & Primary Key Strategy Overview

The database structure is partitioned into 5 independent PostgreSQL schemas corresponding to VieGo's bounded contexts:
1. `identity` (Core Security & Accounts) — Uses **UUIDv7 / UUIDv4** (16 bytes) for public unguessability and security.
2. `exploration` (Geography & Unlocks) — Uses **String ISO** for provinces/wards, and **TSID** (`BIGINT`, 8 bytes) for places & collections.
3. `content` (High-Volume Captures & Reviews) — Uses **TSID** (`BIGINT`, 8 bytes) for write performance & 50% index storage savings.
4. `engagement` (Streaks & Notifications) — Uses **TSID** (`BIGINT`, 8 bytes) for high-frequency notification streams.
5. `social` (High-Volume Feeds & Reactions) — Uses **TSID** (`BIGINT`, 8 bytes) for timeline entries & reactions.

> [!IMPORTANT]
> **No Foreign Keys Across Schemas**: Foreign key constraints MUST NOT cross schema boundaries. All references across schemas (e.g. `explorer_id` in `content.beats`) are raw logical ID columns enforced at the application level.

---

## 1. `identity` Schema (ID Type: `UUID` - 16 bytes)

### `identity.explorers`
Main Explorer account record.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Unique Explorer identifier (UUIDv7/v4) |
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

## 2. `exploration` Schema (ID Type: String ISO / TSID `BIGINT`)

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
| `id` | `BIGINT` | `PRIMARY KEY` | Place TSID (8 bytes) |
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
| `id` | `BIGINT` | `PRIMARY KEY` | Collection entry TSID (8 bytes) |
| `explorer_id` | `UUID` | `NOT NULL` | Logical reference to `identity.explorers(id)` |
| `province_id` | `VARCHAR(16)` | `NOT NULL, FK -> exploration.provinces(id)` | Unlocked province |
| `unlocked_at` | `TIMESTAMPTZ` | `NOT NULL` | Timestamp of first Beat capture in province |
| `first_beat_id` | `BIGINT` | `NOT NULL` | Logical reference to `content.beats(id)` (TSID) |

*Index*: `UNIQUE (explorer_id, province_id)`

---

## 3. `content` Schema (ID Type: TSID `BIGINT` - 8 bytes)

### `content.beats`
High-frequency photo check-in captures.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PRIMARY KEY` | Beat TSID (8 bytes) |
| `explorer_id` | `UUID` | `NOT NULL` | Logical reference to `identity.explorers(id)` |
| `place_id` | `BIGINT` | `NOT NULL` | Logical reference to `exploration.places(id)` (TSID) |
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
| `id` | `BIGINT` | `PRIMARY KEY` | Review TSID (8 bytes) |
| `explorer_id` | `UUID` | `NOT NULL` | Logical reference to `identity.explorers(id)` |
| `place_id` | `BIGINT` | `NOT NULL` | Logical reference to `exploration.places(id)` (TSID) |
| `beat_id` | `BIGINT` | `NOT NULL, FK -> content.beats(id)` | Associated verified Beat (TSID) |
| `rating` | `SMALLINT` | `NOT NULL` | Rating score (1-5) |
| `comment` | `TEXT` | `NOT NULL` | Review comment |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | Review timestamp |

---

## 4. `engagement` Schema (ID Type: TSID `BIGINT` - 8 bytes)

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
| `id` | `BIGINT` | `PRIMARY KEY` | Milestone entry TSID (8 bytes) |
| `explorer_id` | `UUID` | `NOT NULL` | Logical reference to `identity.explorers(id)` |
| `badge_code` | `VARCHAR(32)` | `NOT NULL` | Badge identifier (e.g. `STREAK_7_DAYS`) |
| `unlocked_at` | `TIMESTAMPTZ` | `NOT NULL` | Milestone achievement timestamp |

### `engagement.notifications`
High-volume notification stream.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PRIMARY KEY` | Notification TSID (8 bytes) |
| `recipient_id` | `UUID` | `NOT NULL` | Logical reference to `identity.explorers(id)` |
| `kind` | `VARCHAR(32)` | `NOT NULL` | Type (`STREAK_REMINDER`, `FRIEND_BEAT`, `REACTION`) |
| `payload_json` | `JSONB` | `NOT NULL` | Event detail payload |
| `is_read` | `BOOLEAN` | `NOT NULL DEFAULT FALSE` | Read status |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | Notification timestamp |

---

## 5. `social` Schema (ID Type: TSID `BIGINT` - 8 bytes)

### `social.friendships`
Mutual connections between Explorers.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PRIMARY KEY` | Friendship TSID (8 bytes) |
| `explorer_id` | `UUID` | `NOT NULL` | First Explorer UUID |
| `friend_id` | `UUID` | `NOT NULL` | Second Explorer UUID |
| `established_at` | `TIMESTAMPTZ` | `NOT NULL` | Friendship establishment timestamp |

*Index*: `UNIQUE (explorer_id, friend_id)`

### `social.feed_entries`
High-volume fan-out timeline feed entries.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PRIMARY KEY` | Feed item TSID (8 bytes) |
| `subscriber_id` | `UUID` | `NOT NULL` | Logical reference to recipient Explorer UUID |
| `beat_id` | `BIGINT` | `NOT NULL` | Logical reference to `content.beats(id)` (TSID) |
| `author_id` | `UUID` | `NOT NULL` | Logical reference to author Explorer UUID |
| `feed_type` | `VARCHAR(16)` | `NOT NULL` | Feed context (`FRIEND_FEED`, `DISCOVER`) |
| `published_at` | `TIMESTAMPTZ` | `NOT NULL` | Beat creation timestamp |

*Index*: `INDEX (subscriber_id, feed_type, published_at DESC)`

### `social.reactions`
High-volume social reactions to Beats.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PRIMARY KEY` | Reaction TSID (8 bytes) |
| `beat_id` | `BIGINT` | `NOT NULL` | Logical reference to `content.beats(id)` (TSID) |
| `explorer_id` | `UUID` | `NOT NULL` | Logical reference to `identity.explorers(id)` |
| `kind` | `VARCHAR(16)` | `NOT NULL` | Reaction type (`HEART`, `BOLT`) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | Reaction timestamp |

*Index*: `UNIQUE (beat_id, explorer_id, kind)`
