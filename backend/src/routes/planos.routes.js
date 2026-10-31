
import { Router } from "express";
import { db } from "../db.js";

const router = Router();

// GET /api/planos
// Busca os planos cadastrados no PostgreSQL

router.get("/", async (req, res) => {
  try {
    const resultado = await db.query(`
      SELECT
        id,
        codigo,
        nome,
        valor_mensal,
        ativo
      FROM planos
      WHERE ativo = TRUE
      ORDER BY valor_mensal ASC
    `);

    return res.status(200).json({
      sucesso: true,
      total: resultado.rowCount,
      planos: resultado.rows
    });

  } catch (erro) {
    console.error("Erro ao buscar planos:", erro.message);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno ao consultar os planos."
    });
  }
});

export default router;
