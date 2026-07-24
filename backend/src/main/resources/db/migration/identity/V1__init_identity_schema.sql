-- Schema: identity
-- Managed by identityFlyway bean (history table: identity.flyway_schema_history)
-- Primary keys: UUIDv7 (time-ordered, application-generated) — see ADR-0014.

CREATE SCHEMA IF NOT EXISTS identity;

-- 1. Explorers table
CREATE TABLE IF NOT EXISTS identity.explorers (
    id UUID PRIMARY KEY,
    handle VARCHAR(32) NOT NULL UNIQUE,
    display_name VARCHAR(64) NOT NULL,
    avatar_url TEXT,
    status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Auth Providers table
CREATE TABLE IF NOT EXISTS identity.auth_providers (
    id UUID PRIMARY KEY,
    explorer_id UUID NOT NULL REFERENCES identity.explorers(id) ON DELETE CASCADE,
    provider_kind VARCHAR(16) NOT NULL,
    provider_subject_id VARCHAR(128) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_auth_provider_kind_sub UNIQUE (provider_kind, provider_subject_id)
);

-- 3. Preferences table
CREATE TABLE IF NOT EXISTS identity.preferences (
    explorer_id UUID PRIMARY KEY REFERENCES identity.explorers(id) ON DELETE CASCADE,
    language VARCHAR(8) NOT NULL DEFAULT 'vi',
    theme VARCHAR(8) NOT NULL DEFAULT 'system',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
