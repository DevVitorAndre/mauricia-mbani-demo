
const form = document.getElementById("loginForm");
const mensagem = document.getElementById("mensagem");
const btnEntrar = document.getElementById("btnEntrar");

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  mensagem.textContent = "";
  btnEntrar.disabled = true;
  btnEntrar.textContent = "Entrando...";

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  try {
    const resposta = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, senha })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagem.textContent =
        dados.mensagem || "Não foi possível realizar o login.";
      return;
    }

    // A sessão é mantida por cookie HttpOnly,
    // gerenciado pelo backend.
    window.location.replace("/master/dashboard");

  } catch (erro) {
    console.error("Erro de conexão:", erro);
    mensagem.textContent = "Não foi possível conectar ao servidor.";

  } finally {
    btnEntrar.disabled = false;
    btnEntrar.textContent = "Entrar no Painel Master";
  }
});
