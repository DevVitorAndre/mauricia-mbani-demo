
// ==========================================
// INTEGRACAO DO PAINEL ORIGINAL COM A API
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

  // Exibir o nome do usuario autenticado
  try {
    const resposta = await fetch(
      "/api/clinica/auth/me",
      {
        credentials: "same-origin",
        cache: "no-store"
      }
    );

    if (!resposta.ok) {
      window.location.replace("/clinica/login");
      return;
    }

    const dados = await resposta.json();

    const nomeUsuario = document.querySelector(
      ".admin-profile-info strong"
    );

    const perfilUsuario = document.querySelector(
      ".admin-profile-info small"
    );

    if (nomeUsuario) {
      nomeUsuario.textContent = dados.usuario.nome;
    }

    if (perfilUsuario) {
      perfilUsuario.textContent =
        "Administrador da clínica";
    }

  } catch (erro) {
    console.error("Erro ao carregar perfil:", erro);
  }

  // Sair encerrando a sessao no servidor
  const botaoSair = document.querySelector(
    ".admin-logout-link"
  );

  if (botaoSair) {
    botaoSair.href = "/clinica/login";
    botaoSair.textContent = "Sair do sistema";

    botaoSair.addEventListener("click", async (evento) => {
      evento.preventDefault();

      try {
        const resposta = await fetch(
          "/api/clinica/auth/logout",
          {
            method: "POST",
            credentials: "same-origin"
          }
        );

        if (!resposta.ok) {
          throw new Error("Falha ao encerrar sessão.");
        }

        window.location.replace("/clinica/login");

      } catch (erro) {
        console.error(erro);
        alert("Não foi possível sair do sistema.");
      }
    });
  }
});
