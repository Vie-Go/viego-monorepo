-- Schema: engagement
-- Managed by engagementFlyway bean (history table: engagement.flyway_schema_history)
-- Primary keys: UUIDv7 (time-ordered, application-generated) — see ADR-0014.

CREATE SCHEMA IF NOT EXISTS engagement;

-- 1. Streaks table (Primary Key: explorer_id; NO FK to identity.explorers)
CREATE TABLE IF NOT EXISTS engagement.streaks (
    explorer_id UUID PRIMARY KEY, -- Logical ref to identity.explorers(id)
    current_streak INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    last_capture_date DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Milestones table
CREATE TABLE IF NOT EXISTS engagement.milestones (
    id UUID PRIMARY KEY,
    explorer_id UUID NOT NULL, -- Logical ref to identity.explorers(id)
    badge_code VARCHAR(32) NOT NULL,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Notifications are NOT owned here — they belong to the `notification` schema/module.
