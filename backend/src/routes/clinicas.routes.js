
import { Router } from "express";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { db } from "../db.js";
import { consultarPermissao } from "../services/permissoes.service.js";


const router = Router();

// =====================================
// PROTEGER ROTAS DO MASTER
// =====================================

router.use(async (req, res, next) => {
  if (
    !req.session?.usuarioId ||
    req.session.perfil !== "master"
  ) {
    return res.status(401).json({
      sucesso: false,
      mensagem: "Acesso não autorizado."
    });
  }

  try {
    const resultado = await db.query(
      `SELECT id FROM usuarios
       WHERE id = $1
         AND perfil = 'master'
         AND ativo = TRUE`,
      [req.session.usuarioId]
    );

    if (resultado.rowCount === 0) {
      return res.status(403).json({
        sucesso: false,
        mensagem: "Acesso negado."
      });
    }

    next();
  } catch (erro) {
    console.error("Erro de autenticação:", erro.message);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao validar acesso."
    });
  }
});

// =====================================
// TOKEN DE PROTEÇÃO PARA CADASTROS
// =====================================

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

    res.json({ csrfToken: req.session.csrfToken });
  });
});

// =====================================
// LISTAR CLÍNICAS
// =====================================

router.get("/", async (req, res) => {
  try {
    const resultado = await db.query(`
      SELECT
        c.id,
        c.nome,
        c.slug,
        c.email,
        c.telefone,
        c.status,
        p.nome AS plano,
        a.status AS status_assinatura,
        c.criado_em
      FROM clinicas c
      LEFT JOIN LATERAL (
        SELECT plano_id, status
        FROM assinaturas
        WHERE clinica_id = c.id
          AND status IN ('teste', 'ativa', 'atrasada')
        ORDER BY id DESC
        LIMIT 1
      ) a ON TRUE
      LEFT JOIN planos p ON p.id = a.plano_id
      ORDER BY c.id DESC
    `);

    return res.json({
      sucesso: true,
      total: resultado.rowCount,
      clinicas: resultado.rows
    });
  } catch (erro) {
    console.error("Erro ao listar clínicas:", erro.message);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao consultar clínicas."
    });
  }
});

// =====================================
// CADASTRAR CLÍNICA
// =====================================

router.post("/", async (req, res) => {
  const tokenRecebido = req.get("X-CSRF-Token") || "";
  const tokenSalvo = req.session.csrfToken || "";

  const a = Buffer.from(tokenRecebido);
  const b = Buffer.from(tokenSalvo);

  if (
    !tokenSalvo ||
    a.length !== b.length ||
    !timingSafeEqual(a, b)
  ) {
    return res.status(403).json({
      sucesso: false,
      mensagem: "Token de segurança inválido."
    });
  }

  const { nome, slug, email, telefone, plano_codigo } = req.body ?? {};

  if (
    typeof nome !== "string" ||
    nome.trim().length < 3 ||
    nome.trim().length > 150 ||
    typeof slug !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    slug.length > 80 ||
    typeof plano_codigo !== "string"
  ) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Nome, slug ou plano inválido."
    });
  }

  if (
    (email != null &&
      (typeof email !== "string" ||
       email.length > 150 ||
       (email.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())))) ||
    (telefone != null &&
      (typeof telefone !== "string" || telefone.length > 30))
  ) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "E-mail ou telefone inválido."
    });
  }

  const cliente = await db.connect();

  try {
    await cliente.query("BEGIN");

    // Buscar o plano contratado.
    const plano = await cliente.query(
      `SELECT id FROM planos
       WHERE codigo = $1 AND ativo = TRUE`,
      [plano_codigo]
    );

    if (plano.rowCount === 0) {
      await cliente.query("ROLLBACK");

      return res.status(400).json({
        sucesso: false,
        mensagem: "Plano não encontrado."
      });
    }

    // Criar clínica.
    const clinica = await cliente.query(
      `INSERT INTO clinicas
        (nome, slug, email, telefone)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nome, slug, status`,
      [
        nome.trim(),
        slug,
        email?.trim() || null,
        telefone?.trim() || null
      ]
    );

    const novaClinica = clinica.rows[0];

    // Registrar assinatura inicial.
    await cliente.query(
      `INSERT INTO assinaturas
        (clinica_id, plano_id, status)
       VALUES ($1, $2, 'teste')`,
      [novaClinica.id, plano.rows[0].id]
    );

    await cliente.query("COMMIT");

    return res.status(201).json({
      sucesso: true,
      mensagem: "Clínica cadastrada com sucesso!",
      clinica: novaClinica,
      plano: plano_codigo
    });

  } catch (erro) {
    await cliente.query("ROLLBACK");

    if (erro.code === "23505") {
      return res.status(409).json({
        sucesso: false,
        mensagem: "Já existe uma clínica com esse identificador."
      });
    }

    console.error("Erro ao cadastrar clínica:", erro.message);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao cadastrar clínica."
    });

  } finally {
    cliente.release();
  }
});


// =============================================
// CONSULTAR MODULOS DE UMA CLINICA
// GET /api/master/clinicas/:id/modulos
// =============================================

router.get("/:id/modulos", async (req, res) => {
  const { id } = req.params;

  if (!/^[1-9]\d{0,17}$/.test(id)) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "ID da clínica inválido."
    });
  }

  try {
    const clinica = await db.query(
      `SELECT id, nome, status
       FROM clinicas
       WHERE id = $1`,
      [id]
    );

    if (!clinica.rowCount) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Clínica não encontrada."
      });
    }

    const resultado = await db.query(`
      SELECT
        m.id,
        m.codigo,
        m.nome,
        m.ativo,

        EXISTS (
          SELECT 1
          FROM assinaturas a
          JOIN planos_modulos pm
            ON pm.plano_id = a.plano_id
          WHERE a.clinica_id = $1
            AND a.status IN ('teste', 'ativa')
            AND pm.modulo_id = m.id
        ) AS incluido_plano,

        cm.habilitado AS excecao_master,

        (
          c.status = 'ativa'
          AND m.ativo = TRUE
          AND EXISTS (
            SELECT 1
            FROM assinaturas a
            WHERE a.clinica_id = c.id
              AND a.status IN ('teste', 'ativa')
          )
          AND COALESCE(
            cm.habilitado,
            EXISTS (
              SELECT 1
              FROM assinaturas a
              JOIN planos_modulos pm
                ON pm.plano_id = a.plano_id
              WHERE a.clinica_id = c.id
                AND a.status IN ('teste', 'ativa')
                AND pm.modulo_id = m.id
            )
          )
        ) AS habilitado_final

      FROM modulos m
      CROSS JOIN clinicas c

      LEFT JOIN clinicas_modulos cm
        ON cm.modulo_id = m.id
       AND cm.clinica_id = c.id

      WHERE c.id = $1
      ORDER BY m.nome
    `, [id]);

    return res.json({
      sucesso: true,
      clinica: clinica.rows[0],
      total: resultado.rowCount,
      modulos: resultado.rows
    });

  } catch (erro) {
    console.error(
      "Erro ao consultar módulos da clínica:",
      erro.message
    );

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao consultar módulos."
    });
  }
});


// =============================================
// ALTERAR MODULO DE UMA CLINICA
// PATCH /api/master/clinicas/:id/modulos/:codigo
// =============================================

router.patch("/:id/modulos/:codigo", async (req, res) => {
  const { id, codigo } = req.params;

  // Validar ID da clínica.
  if (!/^[1-9]\d{0,17}$/.test(id)) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "ID da clínica inválido."
    });
  }

  // Validar token CSRF da sessão.
  const tokenRecebido = req.get("X-CSRF-Token") || "";
  const tokenSalvo = req.session.csrfToken || "";

  if (
    !/^[a-f0-9]{64}$/.test(tokenRecebido) ||
    tokenRecebido !== tokenSalvo
  ) {
    return res.status(403).json({
      sucesso: false,
      mensagem: "Token de segurança inválido."
    });
  }

  // true: liberar
  // false: bloquear
  // null: voltar ao padrão do plano
  const habilitado = req.body?.habilitado;

  if (
    habilitado !== true &&
    habilitado !== false &&
    habilitado !== null
  ) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Informe true, false ou null."
    });
  }

  try {
    const clinica = await db.query(
      "SELECT id FROM clinicas WHERE id = $1",
      [id]
    );

    if (!clinica.rowCount) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Clínica não encontrada."
      });
    }

    const modulo = await db.query(
      `SELECT id, nome
       FROM modulos
       WHERE codigo = $1
         AND ativo = TRUE`,
      [codigo]
    );

    if (!modulo.rowCount) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Módulo não encontrado ou inativo."
      });
    }

    if (habilitado === null) {
      // Remove exceção para usar o padrão do plano.
      await db.query(
        `DELETE FROM clinicas_modulos
         WHERE clinica_id = $1
           AND modulo_id = $2`,
        [id, modulo.rows[0].id]
      );

    } else {
      // Cria ou atualiza a exceção do Master.
      await db.query(`
        INSERT INTO clinicas_modulos (
          clinica_id,
          modulo_id,
          habilitado,
          alterado_por
        )
        VALUES ($1, $2, $3, $4)

        ON CONFLICT (clinica_id, modulo_id)

        DO UPDATE SET
          habilitado = EXCLUDED.habilitado,
          alterado_por = EXCLUDED.alterado_por,
          atualizado_em = NOW()
      `, [
        id,
        modulo.rows[0].id,
        habilitado,
        req.session.usuarioId
      ]);
    }

    return res.json({
      sucesso: true,
      mensagem: "Configuração do módulo atualizada!",
      clinica_id: id,
      modulo: codigo,
      excecao_master: habilitado
    });

  } catch (erro) {
    console.error(
      "Erro ao atualizar módulo:",
      erro.message
    );

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao atualizar módulo."
    });
  }
});


// =============================================
// DIAGNOSTICO MASTER DE PERMISSAO
// GET /api/master/clinicas/:id/testar-acesso/:codigo
// =============================================

router.get("/:id/testar-acesso/:codigo", async (req, res) => {
  const { id, codigo } = req.params;

  if (!/^[1-9]\d{0,17}$/.test(id)) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "ID da clínica inválido."
    });
  }

  try {
    const permissao = await consultarPermissao(id, codigo);

    if (!permissao) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Clínica ou módulo não encontrado."
      });
    }

    const status = permissao.permitido ? 200 : 403;

    return res.status(status).json({
      sucesso: permissao.permitido,
      clinica: permissao.clinica_nome,
      modulo: permissao.modulo,
      incluido_plano: permissao.incluido_plano,
      excecao_master: permissao.excecao_master,
      permitido: permissao.permitido,
      mensagem: permissao.permitido
        ? "Módulo autorizado."
        : "Módulo bloqueado."
    });

  } catch (erro) {
    console.error("Erro no teste:", erro.message);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao verificar módulo."
    });
  }
});



export default router;
