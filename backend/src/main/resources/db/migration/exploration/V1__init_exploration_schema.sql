-- Schema: exploration
-- Managed by explorationFlyway bean (history table: exploration.flyway_schema_history)

CREATE SCHEMA IF NOT EXISTS exploration;

-- Enable PostGIS if not enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Provinces table (ISO String primary key e.g. VN-HN)
CREATE TABLE IF NOT EXISTS exploration.provinces (
    id VARCHAR(16) PRIMARY KEY,
    name_vi VARCHAR(128) NOT NULL,
    name_en VARCHAR(128) NOT NULL,
    geometry GEOMETRY(MultiPolygon, 4326) NOT NULL,
    beat_count BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Wards table
CREATE TABLE IF NOT EXISTS exploration.wards (
    id VARCHAR(16) PRIMARY KEY,
    province_id VARCHAR(16) NOT NULL REFERENCES exploration.provinces(id),
    name_vi VARCHAR(128) NOT NULL,
    name_en VARCHAR(128) NOT NULL,
    geometry GEOMETRY(MultiPolygon, 4326) NOT NULL
);

-- 3. Places table (TSID 64-bit BIGINT primary key)
CREATE TABLE IF NOT EXISTS exploration.places (
    id BIGINT PRIMARY KEY,
    province_id VARCHAR(16) NOT NULL REFERENCES exploration.provinces(id),
    ward_id VARCHAR(16) REFERENCES exploration.wards(id),
    name VARCHAR(128) NOT NULL,
    category VARCHAR(32) NOT NULL,
    coordinates GEOMETRY(Point, 4326) NOT NULL,
    description_vi TEXT,
    description_en TEXT,
    rating NUMERIC(3,2) NOT NULL DEFAULT 0.00
);

-- 4. Collections table (TSID 64-bit BIGINT primary key; NO FK to identity.explorers)
CREATE TABLE IF NOT EXISTS exploration.collections (
    id BIGINT PRIMARY KEY,
    explorer_id UUID NOT NULL, -- Logical ref to identity.explorers(id)
    province_id VARCHAR(16) NOT NULL REFERENCES exploration.provinces(id),
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    first_beat_id BIGINT NOT NULL, -- Logical ref to content.beats(id)
    CONSTRAINT uk_collection_explorer_province UNIQUE (explorer_id, province_id)
);
