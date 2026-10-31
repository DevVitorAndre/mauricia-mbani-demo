
-- ==========================================
-- SAAS MASTER
-- MIGRATION 006 - CONVITES DE ACESSO
-- ==========================================

BEGIN;

CREATE TABLE IF NOT EXISTS convites (

    id BIGSERIAL PRIMARY KEY,

    clinica_id BIGINT NOT NULL
        REFERENCES clinicas(id),

    email VARCHAR(255) NOT NULL,

    perfil VARCHAR(30) NOT NULL DEFAULT 'admin_clinica'
        CHECK (perfil = 'admin_clinica'),

    -- Armazena somente o hash do token.
    token_hash VARCHAR(64) NOT NULL UNIQUE,

    criado_por BIGINT NOT NULL
        REFERENCES usuarios(id),

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    expira_em TIMESTAMPTZ NOT NULL,

    utilizado_em TIMESTAMPTZ,

    cancelado_em TIMESTAMPTZ,

    CONSTRAINT convite_validade_check
        CHECK (expira_em > criado_em)
);

CREATE INDEX IF NOT EXISTS idx_convites_clinica
ON convites (clinica_id);

CREATE INDEX IF NOT EXISTS idx_convites_email
ON convites (LOWER(email));

COMMIT;
