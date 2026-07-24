-- Schema: notification
-- Managed by notificationFlyway bean (history table: notification.flyway_schema_history)
-- Primary keys: UUIDv7 (time-ordered, application-generated) — see ADR-0014.

CREATE SCHEMA IF NOT EXISTS notification;

-- 1. Notifications table (one row per notification addressed to one Explorer)
CREATE TABLE IF NOT EXISTS notification.notifications (
    id UUID PRIMARY KEY,
    recipient_id UUID NOT NULL, -- Logical ref to identity.explorers(id)
    kind VARCHAR(32) NOT NULL,
    payload_json JSONB NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Feed query: an Explorer's notifications, newest first.
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created ON notification.notifications(recipient_id, created_at DESC);

-- Badge count: unread only, so the partial index stays small.
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread ON notification.notifications(recipient_id, is_read) WHERE is_read = FALSE;

-- 2. Device tokens (push delivery targets; one Explorer may have several devices)
CREATE TABLE IF NOT EXISTS notification.device_tokens (
    id UUID PRIMARY KEY,
    explorer_id UUID NOT NULL, -- Logical ref to identity.explorers(id)
    token TEXT NOT NULL,
    platform VARCHAR(16) NOT NULL, -- IOS, ANDROID
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_device_token UNIQUE (token)
);

CREATE INDEX IF NOT EXISTS idx_device_tokens_explorer ON notification.device_tokens(explorer_id);
