
-- =====================================
-- MIGRATION 003 - SESSOES DO SISTEMA
-- =====================================

CREATE TABLE IF NOT EXISTS sessoes (
    sid VARCHAR NOT NULL PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessoes_expire
ON sessoes (expire);
