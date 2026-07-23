-- Schema: engagement
-- Managed by engagementFlyway bean (history table: engagement.flyway_schema_history)

CREATE SCHEMA IF NOT EXISTS engagement;

-- 1. Streaks table (Primary Key: explorer_id UUID; NO FK to identity.explorers)
CREATE TABLE IF NOT EXISTS engagement.streaks (
    explorer_id UUID PRIMARY KEY, -- Logical ref to identity.explorers(id)
    current_streak INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    last_capture_date DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Milestones table (TSID 64-bit BIGINT primary key)
CREATE TABLE IF NOT EXISTS engagement.milestones (
    id BIGINT PRIMARY KEY,
    explorer_id UUID NOT NULL, -- Logical ref to identity.explorers(id)
    badge_code VARCHAR(32) NOT NULL,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Notifications table (TSID 64-bit BIGINT primary key)
CREATE TABLE IF NOT EXISTS engagement.notifications (
    id BIGINT PRIMARY KEY,
    recipient_id UUID NOT NULL, -- Logical ref to identity.explorers(id)
    kind VARCHAR(32) NOT NULL,
    payload_json JSONB NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread ON engagement.notifications(recipient_id, is_read) WHERE is_read = FALSE;
