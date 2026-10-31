
-- =========================================
-- SAAS MASTER
-- BANCO DE DADOS - ETAPA 01
-- =========================================

-- 1. PLANOS DO SAAS

CREATE TABLE IF NOT EXISTS planos (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    valor_mensal NUMERIC(10,2) NOT NULL
        CHECK (valor_mensal >= 0),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CLINICAS / EMPRESAS CLIENTES

CREATE TABLE IF NOT EXISTS clinicas (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    slug VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(150),
    telefone VARCHAR(30),
    status VARCHAR(20) NOT NULL DEFAULT 'ativa'
        CHECK (status IN ('ativa', 'suspensa', 'cancelada')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ASSINATURAS DAS CLINICAS

CREATE TABLE IF NOT EXISTS assinaturas (
    id BIGSERIAL PRIMARY KEY,
    clinica_id BIGINT NOT NULL
        REFERENCES clinicas(id),
    plano_id BIGINT NOT NULL
        REFERENCES planos(id),
    status VARCHAR(20) NOT NULL DEFAULT 'teste'
        CHECK (status IN (
            'teste',
            'ativa',
            'atrasada',
            'cancelada'
        )),
    inicio_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fim_em TIMESTAMPTZ,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Impede mais de uma assinatura vigente por clinica
CREATE UNIQUE INDEX IF NOT EXISTS
    idx_assinatura_vigente_clinica
ON assinaturas (clinica_id)
WHERE status IN ('teste', 'ativa', 'atrasada');

-- 4. CADASTRAR NOSSOS PLANOS

INSERT INTO planos (codigo, nome, valor_mensal)
VALUES
    ('basico', 'Básico', 690.00),
    ('plus', 'Plus', 1190.00),
    ('pro', 'Pro', 1690.00)
ON CONFLICT (codigo) DO NOTHING;
