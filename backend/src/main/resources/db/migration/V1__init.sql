-- V1__init.sql
-- Kora Phase 1: minimal health check table to verify Flyway runs.

CREATE TABLE health_check (
    id BIGSERIAL PRIMARY KEY,
    checked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO health_check DEFAULT VALUES;
