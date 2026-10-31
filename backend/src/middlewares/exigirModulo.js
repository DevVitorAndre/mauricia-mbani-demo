
import { consultarPermissao } from "../services/permissoes.service.js";

// Middleware reutilizavel para APIs das clinicas.

export function exigirModulo(codigoModulo) {
  return async (req, res, next) => {
    // A identidade da clinica deve vir da
    // sessao autenticada, nunca do formulario.

    if (
      !req.session?.usuarioId ||
      req.session.perfil !== "admin_clinica" ||
      !req.session.clinicaId
    ) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Acesso da clínica não autenticado."
      });
    }

    try {
      // Confirma que a conta ainda esta ativa
      // e pertence a clinica da sessao.
      const usuario = await req.app.locals.db.query(
        `SELECT id
         FROM usuarios
         WHERE id = $1
           AND clinica_id = $2
           AND perfil = 'admin_clinica'
           AND ativo = TRUE`,
        [
          req.session.usuarioId,
          req.session.clinicaId
        ]
      );

      if (!usuario.rowCount) {
        return res.status(403).json({
          sucesso: false,
          mensagem: "Usuário sem autorização."
        });
      }

      const permissao = await consultarPermissao(
        req.session.clinicaId,
        codigoModulo
      );

      if (!permissao?.permitido) {
        return res.status(403).json({
          sucesso: false,
          codigo: "MODULO_BLOQUEADO",
          mensagem: "Funcionalidade indisponível para esta clínica."
        });
      }

      req.clinicaId = req.session.clinicaId;

      return next();

    } catch (erro) {
      console.error(
        "Erro ao verificar permissão:",
        erro.message
      );

      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao verificar permissões."
      });
    }
  };
}
