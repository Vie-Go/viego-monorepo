-- Schema: content
-- Managed by contentFlyway bean (history table: content.flyway_schema_history)

CREATE SCHEMA IF NOT EXISTS content;
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Beats table (TSID 64-bit BIGINT primary key - 8 bytes storage)
CREATE TABLE IF NOT EXISTS content.beats (
    id BIGINT PRIMARY KEY,
    explorer_id UUID NOT NULL, -- Logical ref to identity.explorers(id)
    place_id BIGINT NOT NULL, -- Logical ref to exploration.places(id)
    province_id VARCHAR(16) NOT NULL, -- Logical ref to exploration.provinces(id)
    media_url TEXT NOT NULL,
    caption TEXT,
    audience VARCHAR(16) NOT NULL,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    coordinates GEOMETRY(Point, 4326) NOT NULL
);

-- Index for timeline queries
CREATE INDEX IF NOT EXISTS idx_beats_explorer_captured ON content.beats(explorer_id, captured_at DESC);

-- 2. Reviews table (TSID 64-bit BIGINT primary key)
CREATE TABLE IF NOT EXISTS content.reviews (
    id BIGINT PRIMARY KEY,
    explorer_id UUID NOT NULL, -- Logical ref to identity.explorers(id)
    place_id BIGINT NOT NULL, -- Logical ref to exploration.places(id)
    beat_id BIGINT NOT NULL REFERENCES content.beats(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Memories table (TSID 64-bit BIGINT primary key)
CREATE TABLE IF NOT EXISTS content.memories (
    id BIGINT PRIMARY KEY,
    explorer_id UUID NOT NULL, -- Logical ref to identity.explorers(id)
    beat_id BIGINT NOT NULL REFERENCES content.beats(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
