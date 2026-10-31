
-- MIGRACAO 008
-- Proteger horarios de consultas concluidas

BEGIN;

ALTER TABLE agendamentos
DROP CONSTRAINT IF EXISTS impedir_agendamento_duplicado;

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
WHERE status IN (
    'pendente',
    'confirmado',
    'concluido'
);

COMMIT;
