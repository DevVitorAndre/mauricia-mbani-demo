
-- SAAS MASTER
-- 004 - MODULOS DOS PLANOS

BEGIN;

CREATE TABLE IF NOT EXISTS modulos (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(60) NOT NULL UNIQUE,
    nome VARCHAR(120) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS planos_modulos (
    plano_id BIGINT NOT NULL REFERENCES planos(id),
    modulo_id BIGINT NOT NULL REFERENCES modulos(id),
    PRIMARY KEY (plano_id, modulo_id)
);

-- FUNCIONALIDADES DO SISTEMA

INSERT INTO modulos (codigo, nome)
VALUES
('site_publico', 'Site público'),
('agenda_online', 'Agendamento online'),
('painel_clinica', 'Painel da clínica'),
('editor_site', 'Editor de conteúdo'),
('whatsapp_link', 'Link WhatsApp'),
('pagamento_online', 'Pagamentos online'),
('financeiro', 'Painel financeiro'),
('whatsapp_automatico', 'WhatsApp automático'),
('chatbot_ia', 'Chatbot IA'),
('seo_avancado', 'SEO avançado')
ON CONFLICT (codigo) DO NOTHING;

-- VINCULAR FUNCIONALIDADES AOS PLANOS

INSERT INTO planos_modulos (plano_id, modulo_id)
SELECT p.id, m.id
FROM planos p
CROSS JOIN modulos m
WHERE
    (
        p.codigo IN ('basico', 'plus', 'pro')
        AND m.codigo IN (
            'site_publico',
            'agenda_online',
            'painel_clinica',
            'editor_site',
            'whatsapp_link'
        )
    )
    OR
    (
        p.codigo IN ('plus', 'pro')
        AND m.codigo IN (
            'pagamento_online',
            'financeiro',
            'whatsapp_automatico'
        )
    )
    OR
    (
        p.codigo = 'pro'
        AND m.codigo IN (
            'chatbot_ia',
            'seo_avancado'
        )
    )
ON CONFLICT (plano_id, modulo_id) DO NOTHING;

COMMIT;
