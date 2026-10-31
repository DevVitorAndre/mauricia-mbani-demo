
const form = document.getElementById("formLogin");
const mensagem = document.getElementById("mensagem");
const botao = document.getElementById("btnEntrar");

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  mensagem.textContent = "";
  botao.disabled = true;
  botao.textContent = "Entrando...";

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  try {
    const resposta = await fetch("/api/clinica/auth/login", {
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
        dados.mensagem || "Não foi possível entrar.";
      return;
    }

 
// Login autenticado: abrir o painel original
window.location.replace(
  "/admin/dashboard.html"
);


  } catch (erro) {
    console.error("Erro no login:", erro);
    mensagem.textContent =
      "Não foi possível conectar ao servidor.";

  } finally {
    botao.disabled = false;
    botao.textContent = "Entrar na minha clínica";
  }
});
