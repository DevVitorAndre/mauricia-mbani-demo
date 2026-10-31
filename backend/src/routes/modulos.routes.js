
import { Router } from "express";
import { db } from "../db.js";

const router = Router();

// ========================================
// VERIFICAR ACESSO MASTER
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

    if (usuario.rowCount === 0) {
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
// LISTAR MÓDULOS DOS PLANOS
// GET /api/master/modulos
// ========================================

router.get("/", async (req, res) => {
  try {
    const resultado = await db.query(`
      SELECT
        m.id,
        m.codigo,
        m.nome,
        m.ativo,

        COALESCE(
          json_agg(
            p.codigo
            ORDER BY p.valor_mensal
          ) FILTER (
            WHERE p.id IS NOT NULL
          ),
          '[]'::json
        ) AS planos

      FROM modulos m

      LEFT JOIN planos_modulos pm
        ON pm.modulo_id = m.id

      LEFT JOIN planos p
        ON p.id = pm.plano_id

      GROUP BY
        m.id,
        m.codigo,
        m.nome,
        m.ativo

      ORDER BY m.nome ASC
    `);

    return res.json({
      sucesso: true,
      total: resultado.rowCount,
      modulos: resultado.rows
    });

  } catch (erro) {
    console.error("Erro ao buscar módulos:", erro.message);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao consultar módulos."
    });
  }
});

export default router;
