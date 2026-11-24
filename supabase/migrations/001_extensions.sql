-- =============================================================================
-- TRYBE Migration 001: Extensions
-- =============================================================================
-- Enables required PostgreSQL extensions for the TRYBE platform.
--   • uuid-ossp  – UUID generation functions (uuid_generate_v4, etc.)
--   • pgcrypto   – Cryptographic functions (gen_random_uuid, crypt, etc.)
--   • pg_trgm    – Trigram-based fuzzy text search (GIN indexes, similarity())
--   • unaccent   – Accent-insensitive text search (unaccent())
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
