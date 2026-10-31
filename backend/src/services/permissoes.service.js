
import { db } from "../db.js";

// Verifica a permissao efetiva de um modulo
// para uma clinica especifica.

export async function consultarPermissao(clinicaId, codigoModulo) {
  const resultado = await db.query(`
    SELECT
      c.id AS clinica_id,
      c.nome AS clinica_nome,
      c.status AS clinica_status,

      m.codigo AS modulo,
      m.ativo AS modulo_ativo,

      EXISTS (
        SELECT 1
        FROM assinaturas a
        WHERE a.clinica_id = c.id
          AND a.status IN ('teste', 'ativa')
      ) AS assinatura_valida,

      EXISTS (
        SELECT 1
        FROM assinaturas a
        JOIN planos_modulos pm
          ON pm.plano_id = a.plano_id
        WHERE a.clinica_id = c.id
          AND a.status IN ('teste', 'ativa')
          AND pm.modulo_id = m.id
      ) AS incluido_plano,

      cm.habilitado AS excecao_master

    FROM clinicas c

    CROSS JOIN modulos m

    LEFT JOIN clinicas_modulos cm
      ON cm.clinica_id = c.id
     AND cm.modulo_id = m.id

    WHERE c.id = $1
      AND m.codigo = $2
  `, [clinicaId, codigoModulo]);

  if (!resultado.rowCount) {
    return null;
  }

  const dados = resultado.rows[0];

  // Uma excecao do Master sobrescreve o plano,
  // mas nunca a suspensao da clinica,
  // a ausencia de assinatura valida ou
  // a desativacao global do modulo.

  const permitido =
    dados.clinica_status === "ativa" &&
    dados.modulo_ativo === true &&
    dados.assinatura_valida === true &&
    (dados.excecao_master ?? dados.incluido_plano);

  return {
    ...dados,
    permitido
  };
}
