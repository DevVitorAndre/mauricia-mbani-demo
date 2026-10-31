
-- ============================================
-- SAAS MASTER
-- MIGRATION 005 - MODULOS POR CLINICA
-- ============================================

BEGIN;

CREATE TABLE IF NOT EXISTS clinicas_modulos (

    id BIGSERIAL PRIMARY KEY,

    clinica_id BIGINT NOT NULL
        REFERENCES clinicas(id) ON DELETE CASCADE,

    modulo_id BIGINT NOT NULL
        REFERENCES modulos(id) ON DELETE CASCADE,

    -- TRUE libera; FALSE bloqueia.
    habilitado BOOLEAN NOT NULL,

    -- Master que realizou a alteração.
    alterado_por BIGINT NOT NULL
        REFERENCES usuarios(id),

    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Uma configuração por módulo e clínica.
    CONSTRAINT uq_clinica_modulo
        UNIQUE (clinica_id, modulo_id)
);

CREATE INDEX IF NOT EXISTS idx_clinicas_modulos_clinica
ON clinicas_modulos (clinica_id);

COMMIT;
