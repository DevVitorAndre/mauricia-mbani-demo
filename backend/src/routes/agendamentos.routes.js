
import { Router } from "express";
import { randomBytes } from "node:crypto";

import { db } from "../db.js";
import { consultarPermissao } from "../services/permissoes.service.js";

const router = Router();

// ============================================
// VALIDACOES
// ============================================

const idValido = (id) =>
  /^[1-9]\d{0,17}$/.test(String(id ?? ""));

const horaValida = (hora) =>
  typeof hora === "string" &&
  /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);

function dataValida(data) {
  if (
    typeof data !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(data)
  ) {
    return false;
  }

  const dataConvertida = new Date(
    `${data}T00:00:00.000Z`
  );

  return (
    !Number.isNaN(dataConvertida.getTime()) &&
    dataConvertida.toISOString().slice(0, 10) === data
  );
}

// ============================================
// PROTEGER TODAS AS ROTAS DA AGENDA
// ============================================

router.use(async (req, res, next) => {
  const sessao = req.session;

  if (
    sessao?.perfil !== "admin_clinica" ||
    !idValido(sessao.usuarioId) ||
    !idValido(sessao.clinicaId)
  ) {
    return res.status(401).json({
      sucesso: false,
      mensagem: "Faça login na clínica."
    });
  }

  try {
    // A identidade e a clinica devem existir
    // e continuar ativas no banco.
    const usuario = await db.query(
      `SELECT u.id
       FROM usuarios u
       JOIN clinicas c
         ON c.id = u.clinica_id
       WHERE u.id = $1
         AND u.clinica_id = $2
         AND u.perfil = 'admin_clinica'
         AND u.ativo = TRUE
         AND c.status = 'ativa'`,
      [sessao.usuarioId, sessao.clinicaId]
    );

    if (!usuario.rowCount) {
      return res.status(403).json({
        sucesso: false,
        mensagem: "Usuário sem autorização."
      });
    }

    // Confirmar direito ao modulo de agenda.
    const permissao = await consultarPermissao(
      sessao.clinicaId,
      "agenda_online"
    );

    if (!permissao?.permitido) {
      return res.status(403).json({
        sucesso: false,
        mensagem: "Agenda indisponível para esta clínica."
      });
    }

    next();

  } catch (erro) {
    console.error("Erro de autorização:", erro.message);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao verificar acesso."
    });
  }
});

// ============================================
// TOKEN CSRF DA CLINICA
// GET /api/clinica/agendamentos/csrf
// ============================================

router.get("/csrf", (req, res) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = randomBytes(32).toString("hex");
  }

  req.session.save((erro) => {
    if (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao preparar sessão."
      });
    }

    return res.json({
      csrfToken: req.session.csrfToken
    });
  });
});


 // ============================================
 // LISTAR PROFISSIONAIS DA CLINICA
 // GET /api/clinica/agendamentos/profissionais
 // ============================================

router.get("/profissionais", async (req, res) => {
    try {
        const resultado = await db.query(
            `SELECT id, nome
             FROM profissionais
             WHERE clinica_id = $1
               AND ativo = TRUE
             ORDER BY nome`,
            [req.session.clinicaId]
        );

        return res.json({
            sucesso: true,
            profissionais: resultado.rows
        });

    } catch (erro) {
        console.error("Erro ao listar profissionais:", erro.message);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao consultar profissionais."
        });
    }
});


// ============================================
// LISTAR AGENDAMENTOS DE UMA DATA
// GET /api/clinica/agendamentos?data=2026-11-10
// ============================================

router.get("/", async (req, res) => {
  const data = req.query.data;

  if (!dataValida(data)) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Informe uma data válida: AAAA-MM-DD."
    });
  }

  try {
    const resultado = await db.query(
      `SELECT
         a.id,
         a.profissional_id,
         p.nome AS profissional,
         a.paciente_nome,
         a.servico,
         a.data_agendamento,
         a.hora_inicio,
         a.hora_fim,
         a.status
       FROM agendamentos a
       JOIN profissionais p
         ON p.id = a.profissional_id
        AND p.clinica_id = a.clinica_id
       WHERE a.clinica_id = $1
         AND a.data_agendamento = $2
       ORDER BY a.hora_inicio, a.id`,
      [req.session.clinicaId, data]
    );

    return res.json({
      sucesso: true,
      total: resultado.rowCount,
      agendamentos: resultado.rows
    });

  } catch (erro) {
    console.error("Erro ao listar agenda:", erro.message);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao consultar agendamentos."
    });
  }
});

// ============================================
// CRIAR AGENDAMENTO
// POST /api/clinica/agendamentos
// ============================================

router.post("/", async (req, res) => {
  // Proteção contra envio por outros sites.
  const token = req.get("X-CSRF-Token") || "";

  if (
    !/^[a-f0-9]{64}$/.test(token) ||
    token !== req.session.csrfToken
  ) {
    return res.status(403).json({
      sucesso: false,
      mensagem: "Token de segurança inválido."
    });
  }

  const {
    profissional_id,
    paciente_nome,
    servico,
    data_agendamento,
    hora_inicio,
    hora_fim
  } = req.body ?? {};

  if (
    !idValido(profissional_id) ||
    typeof paciente_nome !== "string" ||
    paciente_nome.trim().length < 2 ||
    paciente_nome.trim().length > 150 ||
    typeof servico !== "string" ||
    servico.trim().length < 2 ||
    servico.trim().length > 150 ||
    !dataValida(data_agendamento) ||
    !horaValida(hora_inicio) ||
    !horaValida(hora_fim) ||
    hora_fim <= hora_inicio
  ) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Dados ou horários inválidos."
    });
  }

  try {
    // Profissional precisa pertencer à clínica
    // autenticada e estar ativo.
    const profissional = await db.query(
      `SELECT id
       FROM profissionais
       WHERE id = $1
         AND clinica_id = $2
         AND ativo = TRUE`,
      [
        profissional_id,
        req.session.clinicaId
      ]
    );

    if (!profissional.rowCount) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Profissional não encontrado nesta clínica."
      });
    }

    // Nunca aceitar clinica_id enviado pelo navegador.
    // O valor vem exclusivamente da sessão.
    const resultado = await db.query(
      `INSERT INTO agendamentos (
         clinica_id,
         profissional_id,
         paciente_nome,
         servico,
         data_agendamento,
         hora_inicio,
         hora_fim
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING
         id,
         clinica_id,
         profissional_id,
         paciente_nome,
         servico,
         data_agendamento,
         hora_inicio,
         hora_fim,
         status`,
      [
        req.session.clinicaId,
        profissional_id,
        paciente_nome.trim(),
        servico.trim(),
        data_agendamento,
        hora_inicio,
        hora_fim
      ]
    );

    return res.status(201).json({
      sucesso: true,
      mensagem: "Agendamento criado com sucesso!",
      agendamento: resultado.rows[0]
    });

  } catch (erro) {
    // PostgreSQL: exclusion_violation
    // A restrição do banco impediu a sobreposição.
    if (erro.code === "23P01") {
      return res.status(409).json({
        sucesso: false,
        mensagem: "Este horário já está ocupado."
      });
    }

    // Profissional removido durante a operação.
    if (erro.code === "23503") {
      return res.status(409).json({
        sucesso: false,
        mensagem: "Profissional indisponível."
      });
    }

    console.error("Erro ao agendar:", erro.message);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao salvar agendamento."
    });
  }
});


 // ============================================
 // CONFIRMAR AGENDAMENTO
 // PATCH /api/clinica/agendamentos/:id/confirmar
 // ============================================

router.patch("/:id/confirmar", async (req, res) => {

    const { id } = req.params;

    // Validar ID
    if (!idValido(id)) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "ID do agendamento inválido."
        });
    }

    // Validar token CSRF
    const token = req.get("X-CSRF-Token") || "";

    if (
        !/^[a-f0-9]{64}$/.test(token) ||
        token !== req.session.csrfToken
    ) {
        return res.status(403).json({
            sucesso: false,
            mensagem: "Token de segurança inválido."
        });
    }

    try {

        // Atualizar somente consultas pendentes
        // da clínica autenticada.
        const resultado = await db.query(
            `UPDATE agendamentos
             SET status = 'confirmado',
                 atualizado_em = NOW()
             WHERE id = $1
               AND clinica_id = $2
               AND status = 'pendente'
             RETURNING id, status`,
            [id, req.session.clinicaId]
        );

        if (!resultado.rowCount) {

            const consulta = await db.query(
                `SELECT status
                 FROM agendamentos
                 WHERE id = $1
                   AND clinica_id = $2`,
                [id, req.session.clinicaId]
            );

            if (!consulta.rowCount) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Agendamento não encontrado."
                });
            }

            return res.status(409).json({
                sucesso: false,
                mensagem: "Esta consulta não está pendente."
            });
        }

        return res.json({
            sucesso: true,
            mensagem: "Consulta confirmada com sucesso!",
            agendamento: resultado.rows[0]
        });

    } catch (erro) {

        console.error(
            "Erro ao confirmar agendamento:",
            erro.message
        );

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao confirmar consulta."
        });
    }
});


export default router;
