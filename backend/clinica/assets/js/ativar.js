
const $ = (id) => document.getElementById(id);

// O token vem do fragmento # do link.
// Exemplo: /clinica/ativar#TOKEN
const token = window.location.hash.slice(1);

// Retirar o token da barra de endereço.
history.replaceState(
  null,
  "",
  window.location.pathname
);

// =======================================
// FUNÇÃO PARA ENVIAR REQUISIÇÕES
// =======================================

async function enviar(url, dados) {
  const resposta = await fetch(url, {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dados)
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    throw new Error(
      resultado.mensagem || "Erro na solicitação."
    );
  }

  return resultado;
}

// =======================================
// VERIFICAR SE O CONVITE É VÁLIDO
// =======================================

async function verificarConvite() {
  if (!/^[a-f0-9]{64}$/.test(token)) {
    $("statusConvite").textContent =
      "Convite ausente ou inválido.";
    return;
  }

  try {
    const dados = await enviar(
      "/api/ativacao/validar",
      { token }
    );

    $("nomeClinica").textContent =
      dados.convite.clinica;

    $("emailConvite").textContent =
      dados.convite.email;

    $("statusConvite").textContent =
      "Convite válido! Crie sua senha para continuar.";

    $("dadosConvite").hidden = false;

  } catch (erro) {
    $("statusConvite").textContent =
      erro.message;
  }
}

// =======================================
// CRIAR CONTA DA PROFISSIONAL
// =======================================

$("formAtivacao").addEventListener(
  "submit",
  async (evento) => {
    evento.preventDefault();

    const nome = $("nome").value.trim();
    const senha = $("senha").value;
    const confirmar = $("confirmarSenha").value;

    $("mensagem").textContent = "";

    if (senha !== confirmar) {
      $("mensagem").textContent =
        "As senhas não coincidem.";
      return;
    }

    const btn = $("btnAtivar");

    btn.disabled = true;
    btn.textContent = "Criando conta...";

    try {
      const resultado = await enviar(
        "/api/ativacao/aceitar",
        {
          token,
          nome,
          senha
        }
      );

      $("dadosConvite").hidden = true;

      $("statusConvite").textContent =
        resultado.mensagem +
        " Seu cadastro foi concluído. " +
        "O login da clínica será disponibilizado em seguida.";

    } catch (erro) {
      $("mensagem").textContent =
        erro.message;

    } finally {
      $("senha").value = "";
      $("confirmarSenha").value = "";

      btn.disabled = false;
      btn.textContent = "Criar minha conta";
    }
  }
);

// Iniciar validação ao abrir a página.
verificarConvite();


