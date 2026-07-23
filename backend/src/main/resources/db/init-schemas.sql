-- VieGo Local Development Database & Multi-Schema Initialization
-- PostgreSQL 16+ with PostGIS spatial extension

CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Identity Schema (Explorer accounts, auth providers, preferences)
CREATE SCHEMA IF NOT EXISTS identity;

-- 2. Exploration Schema (Provinces, wards, places, collections)
CREATE SCHEMA IF NOT EXISTS exploration;

-- 3. Content Schema (Beats, reviews, memories)
CREATE SCHEMA IF NOT EXISTS content;

-- 4. Engagement Schema (Streaks, milestones, notifications)
CREATE SCHEMA IF NOT EXISTS engagement;

-- 5. Social Schema (Friendships, invite links, feed entries, reactions)
CREATE SCHEMA IF NOT EXISTS social;
