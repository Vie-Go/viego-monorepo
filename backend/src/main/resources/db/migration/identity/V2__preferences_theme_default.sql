-- Corrective migration (research.md R8): the OpenAPI contract's Preferences.theme enum is
-- light|dark only — "system" was never a documented value. V1 is not edited (migrations are
-- append-only); this changes the column default going forward for any row inserted without an
-- explicit theme.
ALTER TABLE identity.preferences ALTER COLUMN theme SET DEFAULT 'light';
