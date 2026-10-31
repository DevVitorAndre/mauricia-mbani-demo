
import { Router } from "express";
import {
  randomBytes,
  createHash,
  timingSafeEqual
} from "node:crypto";

import { db } from "../db.js";

const router = Router();

// ========================================
// PROTEÇÃO MASTER
// ========================================

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
    const usuario = await db.query(
      `SELECT id
       FROM usuarios
       WHERE id = $1
         AND perfil = 'master'
         AND ativo = TRUE`,
      [req.session.usuarioId]
    );

    if (!usuario.rowCount) {
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
      mensagem: "Erro ao verificar acesso."
    });
  }
});

// ========================================
// CRIAR CONVITE
// POST /api/master/convites
// ========================================

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

  const { clinica_id, email } = req.body ?? {};

  if (
    typeof clinica_id !== "string" &&
    typeof clinica_id !== "number"
  ) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "ID da clínica inválido."
    });
  }

  const clinicaId = String(clinica_id);

  if (!/^[1-9]\d{0,17}$/.test(clinicaId)) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "ID da clínica inválido."
    });
  }

  if (typeof email !== "string") {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Informe um e-mail válido."
    });
  }

  const emailNormalizado = email.trim().toLowerCase();

  if (
    emailNormalizado.length > 255 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)
  ) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Informe um e-mail válido."
    });
  }

  const cliente = await db.connect();

  try {
    await cliente.query("BEGIN");

    // Confere a clínica e bloqueia a linha durante
    // a operação para evitar convites concorrentes.
    const clinica = await cliente.query(
      `SELECT id, nome
       FROM clinicas
       WHERE id = $1 AND status = 'ativa'
       FOR UPDATE`,
      [clinicaId]
    );

    if (!clinica.rowCount) {
      await cliente.query("ROLLBACK");

      return res.status(404).json({
        sucesso: false,
        mensagem: "Clínica ativa não encontrada."
      });
    }

    // A versão atual utiliza e-mail único
    // para todos os usuários da plataforma.
    const existente = await cliente.query(
      `SELECT id FROM usuarios
       WHERE LOWER(email) = $1
       LIMIT 1`,
      [emailNormalizado]
    );

    if (existente.rowCount) {
      await cliente.query("ROLLBACK");

      return res.status(409).json({
        sucesso: false,
        mensagem: "Esse e-mail já possui uma conta."
      });
    }

    // Invalida convites anteriores ainda pendentes
    // para o mesmo e-mail e clínica.
    await cliente.query(
      `UPDATE convites
       SET cancelado_em = NOW()
       WHERE clinica_id = $1
         AND LOWER(email) = $2
         AND utilizado_em IS NULL
         AND cancelado_em IS NULL`,
      [clinicaId, emailNormalizado]
    );

    // Token aleatório de uso único.
    const token = randomBytes(32).toString("hex");

    // Só o hash será salvo no PostgreSQL.
    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    const resultado = await cliente.query(
      `INSERT INTO convites (
        clinica_id,
        email,
        perfil,
        token_hash,
        criado_por,
        expira_em
      )
      VALUES (
        $1,
        $2,
        'admin_clinica',
        $3,
        $4,
        NOW() + INTERVAL '24 hours'
      )
      RETURNING id, email, expira_em`,
      [
        clinicaId,
        emailNormalizado,
        tokenHash,
        req.session.usuarioId
      ]
    );

    await cliente.query("COMMIT");

    // Não permitir cache da resposta sensível.
    res.set("Cache-Control", "no-store");

    return res.status(201).json({
      sucesso: true,
      mensagem: "Convite gerado com sucesso!",
      clinica: clinica.rows[0].nome,
      convite: {
        id: resultado.rows[0].id,
        email: resultado.rows[0].email,
        expira_em: resultado.rows[0].expira_em,
        token
      }
    });

  } catch (erro) {
    await cliente.query("ROLLBACK");

    console.error("Erro ao criar convite:", erro.message);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao gerar convite."
    });

  } finally {
    cliente.release();
  }
});

export default router;
