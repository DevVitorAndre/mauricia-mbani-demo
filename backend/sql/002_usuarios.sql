
-- ============================================
-- SAAS MASTER
-- MIGRATION 002 - USUARIOS
-- ============================================

CREATE TABLE IF NOT EXISTS usuarios (

    id BIGSERIAL PRIMARY KEY,

    -- NULL para Master.
    -- Vinculado a uma clinica para admin_clinica.
    clinica_id BIGINT
        REFERENCES clinicas(id),

    nome VARCHAR(150) NOT NULL,

    email VARCHAR(255) NOT NULL,

    -- Nunca armazenar senhas em texto puro.
    senha_hash TEXT NOT NULL,

    perfil VARCHAR(30) NOT NULL
        CHECK (perfil IN ('master', 'admin_clinica')),

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT usuario_clinica_perfil_check
    CHECK (
        (perfil = 'master' AND clinica_id IS NULL)
        OR
        (perfil = 'admin_clinica' AND clinica_id IS NOT NULL)
    )

);

-- Impede dois cadastros com o mesmo e-mail,
-- inclusive usando maiusculas/minusculas diferentes.

CREATE UNIQUE INDEX IF NOT EXISTS
    idx_usuarios_email_unico
ON usuarios (LOWER(email));

-- Facilita consultar usuarios de uma clinica.

CREATE INDEX IF NOT EXISTS
    idx_usuarios_clinica
ON usuarios (clinica_id);
