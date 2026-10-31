
import { Router } from "express";
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { rateLimit } from "express-rate-limit";

import { db } from "../db.js";

const router = Router();

// ========================================
// LIMITAR TENTATIVAS DE ATIVACAO
// ========================================

router.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    sucesso: false,
    mensagem: "Muitas tentativas. Tente novamente mais tarde."
  }
}));

// ========================================
// FUNCOES AUXILIARES
// ========================================

function tokenValido(token) {
  return (
    typeof token === "string" &&
    /^[a-f0-9]{64}$/.test(token)
  );
}

function gerarHashToken(token) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

// ========================================
// VALIDAR CONVITE
// POST /api/ativacao/validar
// ========================================

router.post("/validar", async (req, res) => {
  const { token } = req.body ?? {};

  if (!tokenValido(token)) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Convite inválido."
    });
  }

  try {
    const resultado = await db.query(`
      SELECT
        c.nome AS clinica,
        v.email,
        v.expira_em

      FROM convites v

      JOIN clinicas c
        ON c.id = v.clinica_id

      WHERE v.token_hash = $1
        AND v.utilizado_em IS NULL
        AND v.cancelado_em IS NULL
        AND v.expira_em > NOW()
        AND c.status = 'ativa'
    `, [gerarHashToken(token)]);

    if (!resultado.rowCount) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Convite inválido ou expirado."
      });
    }

    res.set("Cache-Control", "no-store");

    return res.json({
      sucesso: true,
      convite: resultado.rows[0]
    });

  } catch (erro) {
    console.error("Erro ao validar convite:", erro.message);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno ao validar convite."
    });
  }
});

// ========================================
// ACEITAR CONVITE
// POST /api/ativacao/aceitar
// ========================================

router.post("/aceitar", async (req, res) => {
  const { token, nome, senha } = req.body ?? {};

  // Validar token
  if (!tokenValido(token)) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Convite inválido."
    });
  }

  // Validar nome
  if (
    typeof nome !== "string" ||
    nome.trim().length < 3 ||
    nome.trim().length > 150
  ) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Informe um nome válido."
    });
  }

  // Validar senha
  if (
    typeof senha !== "string" ||
    senha.length < 12 ||
    Buffer.byteLength(senha, "utf8") > 72
  ) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "A senha deve ter no mínimo 12 caracteres e no máximo 72 bytes."
    });
  }

  const cliente = await db.connect();

  try {
    // Gerar hash da senha
    const senhaHash = await bcrypt.hash(senha, 12);

    await cliente.query("BEGIN");

    // Localizar e bloquear o convite durante o cadastro
    const resultado = await cliente.query(`
      SELECT
        v.id,
        v.email,
        v.clinica_id

      FROM convites v

      JOIN clinicas c
        ON c.id = v.clinica_id

      WHERE v.token_hash = $1
        AND v.utilizado_em IS NULL
        AND v.cancelado_em IS NULL
        AND v.expira_em > NOW()
        AND c.status = 'ativa'

      FOR UPDATE OF v
    `, [gerarHashToken(token)]);

    if (!resultado.rowCount) {
      await cliente.query("ROLLBACK");

      return res.status(400).json({
        sucesso: false,
        mensagem: "Convite inválido ou expirado."
      });
    }

    const convite = resultado.rows[0];

    // Criar o usuario da clinica
    const usuario = await cliente.query(`
      INSERT INTO usuarios (
        nome,
        email,
        senha_hash,
        perfil,
        clinica_id,
        ativo
      )
      VALUES (
        $1,
        $2,
        $3,
        'admin_clinica',
        $4,
        TRUE
      )
      RETURNING
        id,
        nome,
        email,
        perfil,
        clinica_id
    `, [
      nome.trim(),
      convite.email,
      senhaHash,
      convite.clinica_id
    ]);

    // Marcar o convite como utilizado
    await cliente.query(`
      UPDATE convites
      SET utilizado_em = NOW()
      WHERE id = $1
    `, [convite.id]);

    await cliente.query("COMMIT");

    res.set("Cache-Control", "no-store");

    return res.status(201).json({
      sucesso: true,
      mensagem: "Conta criada com sucesso!",
      usuario: usuario.rows[0]
    });

  } catch (erro) {
    await cliente.query("ROLLBACK");

    if (erro.code === "23505") {
      return res.status(409).json({
        sucesso: false,
        mensagem: "Esse e-mail já possui uma conta."
      });
    }

    console.error("Erro ao ativar conta:", erro.message);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao criar a conta."
    });

  } finally {
    cliente.release();
  }
});

export default router;
