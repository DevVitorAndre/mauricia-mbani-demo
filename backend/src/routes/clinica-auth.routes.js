
import { Router } from "express";
import bcrypt from "bcryptjs";
import { rateLimit } from "express-rate-limit";

import { db } from "../db.js";

const router = Router();

// ========================================
// LIMITAR TENTATIVAS DE LOGIN
// ========================================

const limitarLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    sucesso: false,
    mensagem: "Muitas tentativas. Tente novamente mais tarde."
  }
});

// ========================================
// LOGIN DA CLINICA
// POST /api/clinica/auth/login
// ========================================

router.post("/login", limitarLogin, async (req, res) => {
  const { email, senha } = req.body ?? {};

  if (
    typeof email !== "string" ||
    typeof senha !== "string" ||
    !email.trim() ||
    !senha ||
    email.length > 255 ||
    senha.length > 1024
  ) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Informe e-mail e senha válidos."
    });
  }

  try {
    const resultado = await db.query(`
      SELECT
        u.id,
        u.nome,
        u.email,
        u.senha_hash,
        u.perfil,
        u.clinica_id,
        c.nome AS clinica_nome

      FROM usuarios u

      JOIN clinicas c
        ON c.id = u.clinica_id

      WHERE LOWER(u.email) = LOWER($1)
        AND u.perfil = 'admin_clinica'
        AND u.ativo = TRUE
        AND c.status = 'ativa'

      LIMIT 1
    `, [email.trim()]);

    const usuario = resultado.rows[0];

    if (!usuario) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "E-mail ou senha inválidos."
      });
    }

    const senhaCorreta = await bcrypt.compare(
      senha,
      usuario.senha_hash
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "E-mail ou senha inválidos."
      });
    }

    // Regenerar a sessão após autenticar.
    req.session.regenerate((erro) => {
      if (erro) {
        console.error("Erro na sessão:", erro.message);

        return res.status(500).json({
          sucesso: false,
          mensagem: "Erro ao iniciar sessão."
        });
      }

      // Guardar identidade e clínica no servidor.
      req.session.usuarioId = String(usuario.id);
      req.session.perfil = "admin_clinica";
      req.session.clinicaId = String(usuario.clinica_id);

      req.session.save((erroSalvar) => {
        if (erroSalvar) {
          console.error("Erro ao salvar sessão:", erroSalvar.message);

          return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao salvar sessão."
          });
        }

        return res.json({
          sucesso: true,
          mensagem: "Login da clínica realizado com sucesso!",
          usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil
          },
          clinica: {
            id: usuario.clinica_id,
            nome: usuario.clinica_nome
          }
        });
      });
    });

  } catch (erro) {
    console.error("Erro no login da clínica:", erro.message);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno ao realizar login."
    });
  }
});

// ========================================
// CONSULTAR SESSAO DA CLINICA
// GET /api/clinica/auth/me
// ========================================

router.get("/me", async (req, res) => {
  if (
    req.session?.perfil !== "admin_clinica" ||
    !req.session.usuarioId ||
    !req.session.clinicaId
  ) {
    return res.status(401).json({
      autenticado: false
    });
  }

  try {
    const resultado = await db.query(`
      SELECT
        u.id,
        u.nome,
        u.email,
        u.perfil,
        c.id AS clinica_id,
        c.nome AS clinica_nome

      FROM usuarios u

      JOIN clinicas c
        ON c.id = u.clinica_id

      WHERE u.id = $1
        AND u.clinica_id = $2
        AND u.perfil = 'admin_clinica'
        AND u.ativo = TRUE
        AND c.status = 'ativa'
    `, [
      req.session.usuarioId,
      req.session.clinicaId
    ]);

    if (!resultado.rowCount) {
      return res.status(401).json({
        autenticado: false
      });
    }

    return res.json({
      autenticado: true,
      usuario: resultado.rows[0]
    });

  } catch (erro) {
    console.error("Erro ao consultar sessão:", erro.message);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao consultar sessão."
    });
  }
});

// ========================================
// LOGOUT DA CLINICA
// POST /api/clinica/auth/logout
// ========================================

router.post("/logout", (req, res) => {
  if (req.session?.perfil !== "admin_clinica") {
    return res.status(401).json({
      sucesso: false,
      mensagem: "Sessão da clínica não encontrada."
    });
  }

  req.session.destroy((erro) => {
    if (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: "Não foi possível encerrar sessão."
      });
    }

    res.clearCookie("saas.master.sid", {
      path: "/"
    });

    return res.json({
      sucesso: true,
      mensagem: "Logout realizado com sucesso!"
    });
  });
});

export default router;
