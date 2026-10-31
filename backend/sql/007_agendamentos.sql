
-- ============================================
-- SAAS MASTER
-- 007 - AGENDA E AGENDAMENTOS
-- ============================================

BEGIN;

-- Permite criar restrições de conflito
-- envolvendo IDs e intervalos de horários.

CREATE EXTENSION IF NOT EXISTS btree_gist;


-- ============================================
-- 1. PROFISSIONAIS DA CLINICA
-- ============================================

CREATE TABLE IF NOT EXISTS profissionais (

    id BIGSERIAL PRIMARY KEY,

    clinica_id BIGINT NOT NULL
        REFERENCES clinicas(id),

    nome VARCHAR(150) NOT NULL,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (clinica_id, id)

);


-- ============================================
-- 2. AGENDAMENTOS
-- ============================================

CREATE TABLE IF NOT EXISTS agendamentos (

    id BIGSERIAL PRIMARY KEY,

    clinica_id BIGINT NOT NULL
        REFERENCES clinicas(id),

    profissional_id BIGINT NOT NULL,

    paciente_nome VARCHAR(150) NOT NULL,

    paciente_email VARCHAR(255),

    paciente_telefone VARCHAR(30),

    servico VARCHAR(150) NOT NULL,

    data_agendamento DATE NOT NULL,

    hora_inicio TIME NOT NULL,

    hora_fim TIME NOT NULL,

    status VARCHAR(20) NOT NULL
        DEFAULT 'pendente'
        CHECK (
            status IN (
                'pendente',
                'confirmado',
                'concluido',
                'cancelado'
            )
        ),

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- O profissional deve pertencer
    -- à mesma clínica do agendamento.

    CONSTRAINT fk_agendamento_profissional
        FOREIGN KEY (clinica_id, profissional_id)
        REFERENCES profissionais(clinica_id, id),

    -- O horário final deve ser maior
    -- que o horário inicial.

    CONSTRAINT chk_horario_valido
        CHECK (hora_fim > hora_inicio)

);


-- ============================================
-- 3. IMPEDIR HORARIOS SOBREPOSTOS
-- ============================================

ALTER TABLE agendamentos
ADD CONSTRAINT impedir_agendamento_duplicado
EXCLUDE USING GIST (

    profissional_id WITH =,

    tsrange(
        data_agendamento + hora_inicio,
        data_agendamento + hora_fim,
        '[)'
    ) WITH &&

)
WHERE (
    status IN ('pendente', 'confirmado')
);


-- ============================================
-- 4. INDICE PARA CONSULTAR AGENDA
-- ============================================

CREATE INDEX IF NOT EXISTS idx_agendamentos_clinica_data
ON agendamentos (
    clinica_id,
    data_agendamento,
    hora_inicio
);

COMMIT;
