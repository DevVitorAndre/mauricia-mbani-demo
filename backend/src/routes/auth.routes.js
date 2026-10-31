
import { Router } from "express";
import bcrypt from "bcryptjs";
import { rateLimit } from "express-rate-limit";
import { db } from "../db.js";

const router = Router();

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

// LOGIN DO MASTER
router.post("/login", limitarLogin, async (req, res) => {
  try {
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

    const resultado = await db.query(
      `SELECT id, nome, email, senha_hash, ativo
       FROM usuarios
       WHERE LOWER(email) = LOWER($1)
         AND perfil = 'master'
       LIMIT 1`,
      [email.trim()]
    );

    const usuario = resultado.rows[0];

    if (!usuario || !usuario.ativo) {
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

    // Gera uma nova sessão após autenticar.
    req.session.regenerate((erro) => {
      if (erro) {
        console.error("Erro ao renovar sessão:", erro.message);

        return res.status(500).json({
          sucesso: false,
          mensagem: "Erro ao iniciar a sessão."
        });
      }

      req.session.usuarioId = String(usuario.id);
      req.session.perfil = "master";

      req.session.save((erroSalvar) => {
        if (erroSalvar) {
          console.error("Erro ao salvar sessão:", erroSalvar.message);

          return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao salvar a sessão."
          });
        }

        return res.json({
          sucesso: true,
          mensagem: "Login realizado com sucesso!",
          usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: "master"
          }
        });
      });
    });

  } catch (erro) {
    console.error("Erro no login:", erro.message);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno ao realizar login."
    });
  }
});

// CONSULTAR USUÁRIO CONECTADO
router.get("/me", async (req, res) => {
  if (!req.session?.usuarioId ||
      req.session.perfil !== "master") {
    return res.status(401).json({
      autenticado: false
    });
  }

  try {
    const resultado = await db.query(
      `SELECT id, nome, email, perfil
       FROM usuarios
       WHERE id = $1
         AND perfil = 'master'
         AND ativo = TRUE`,
      [req.session.usuarioId]
    );

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
    console.error("Erro ao consultar usuário:", erro.message);

    return res.status(500).json({
      mensagem: "Erro ao consultar a sessão."
    });
  }
});

// SAIR DO SISTEMA
router.post("/logout", (req, res) => {
  req.session.destroy((erro) => {
    if (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: "Não foi possível encerrar a sessão."
      });
    }

    res.clearCookie("saas.master.sid", { path: "/" });

    return res.json({
      sucesso: true,
      mensagem: "Logout realizado com sucesso!"
    });
  });
});

export default router;
