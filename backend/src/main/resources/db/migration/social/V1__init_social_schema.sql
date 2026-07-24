-- Schema: social
-- Managed by socialFlyway bean (history table: social.flyway_schema_history)
-- Primary keys: UUIDv7 (time-ordered, application-generated) — see ADR-0014.

CREATE SCHEMA IF NOT EXISTS social;

-- 1. Friendships table
CREATE TABLE IF NOT EXISTS social.friendships (
    id UUID PRIMARY KEY,
    explorer_id UUID NOT NULL, -- Logical ref to identity.explorers(id)
    friend_id UUID NOT NULL, -- Logical ref to identity.explorers(id)
    established_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_friendship_pair UNIQUE (explorer_id, friend_id)
);

-- 2. Invite Links table
CREATE TABLE IF NOT EXISTS social.invite_links (
    id UUID PRIMARY KEY,
    sharer_id UUID NOT NULL, -- Logical ref to identity.explorers(id)
    code VARCHAR(32) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Feed Entries table (highest-volume table — fan-out on write)
CREATE TABLE IF NOT EXISTS social.feed_entries (
    id UUID PRIMARY KEY,
    subscriber_id UUID NOT NULL, -- Logical ref to recipient Explorer
    beat_id UUID NOT NULL, -- Logical ref to content.beats(id)
    author_id UUID NOT NULL, -- Logical ref to author Explorer
    feed_type VARCHAR(16) NOT NULL,
    published_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feed_entries_timeline ON social.feed_entries(subscriber_id, feed_type, published_at DESC);

-- 4. Reactions table
CREATE TABLE IF NOT EXISTS social.reactions (
    id UUID PRIMARY KEY,
    beat_id UUID NOT NULL, -- Logical ref to content.beats(id)
    explorer_id UUID NOT NULL, -- Logical ref to identity.explorers(id)
    kind VARCHAR(16) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_reaction_beat_explorer_kind UNIQUE (beat_id, explorer_id, kind)
);
