-- Schema: social
-- Managed by socialFlyway bean (history table: social.flyway_schema_history)

CREATE SCHEMA IF NOT EXISTS social;

-- 1. Friendships table (TSID 64-bit BIGINT primary key)
CREATE TABLE IF NOT EXISTS social.friendships (
    id BIGINT PRIMARY KEY,
    explorer_id UUID NOT NULL, -- Logical ref to identity.explorers(id)
    friend_id UUID NOT NULL, -- Logical ref to identity.explorers(id)
    established_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_friendship_pair UNIQUE (explorer_id, friend_id)
);

-- 2. Invite Links table (TSID 64-bit BIGINT primary key)
CREATE TABLE IF NOT EXISTS social.invite_links (
    id BIGINT PRIMARY KEY,
    sharer_id UUID NOT NULL, -- Logical ref to identity.explorers(id)
    code VARCHAR(32) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Feed Entries table (TSID 64-bit BIGINT primary key - High volume)
CREATE TABLE IF NOT EXISTS social.feed_entries (
    id BIGINT PRIMARY KEY,
    subscriber_id UUID NOT NULL, -- Logical ref to recipient Explorer UUID
    beat_id BIGINT NOT NULL, -- Logical ref to content.beats(id) (TSID)
    author_id UUID NOT NULL, -- Logical ref to author Explorer UUID
    feed_type VARCHAR(16) NOT NULL,
    published_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feed_entries_timeline ON social.feed_entries(subscriber_id, feed_type, published_at DESC);

-- 4. Reactions table (TSID 64-bit BIGINT primary key)
CREATE TABLE IF NOT EXISTS social.reactions (
    id BIGINT PRIMARY KEY,
    beat_id BIGINT NOT NULL, -- Logical ref to content.beats(id) (TSID)
    explorer_id UUID NOT NULL, -- Logical ref to identity.explorers(id)
    kind VARCHAR(16) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_reaction_beat_explorer_kind UNIQUE (beat_id, explorer_id, kind)
);
