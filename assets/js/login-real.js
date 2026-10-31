
// ==========================================
// LOGIN REAL DA CLINICA
// ==========================================

const formulario = document.getElementById("admin-login-form");

const campoEmail = document.getElementById("admin-user");
const campoSenha = document.getElementById("admin-password");

const mensagem = document.getElementById("admin-login-message");
const botaoEntrar = document.getElementById("admin-login-submit");

const botaoMostrarSenha = document.getElementById(
    "admin-toggle-password"
);

// ==========================================
// MOSTRAR E OCULTAR SENHA
// ==========================================

botaoMostrarSenha.addEventListener("click", () => {

    const senhaVisivel = campoSenha.type === "text";

    campoSenha.type = senhaVisivel ? "password" : "text";

    botaoMostrarSenha.textContent = senhaVisivel
        ? "Mostrar"
        : "Ocultar";

    botaoMostrarSenha.setAttribute(
        "aria-pressed",
        String(!senhaVisivel)
    );

    botaoMostrarSenha.setAttribute(
        "aria-label",
        senhaVisivel ? "Mostrar senha" : "Ocultar senha"
    );

});

// ==========================================
// AUTENTICACAO NO BACKEND
// ==========================================

formulario.addEventListener("submit", async (evento) => {

    evento.preventDefault();

    mensagem.hidden = true;
    mensagem.textContent = "";

    botaoEntrar.disabled = true;

    const textoBotao = botaoEntrar.innerHTML;

    botaoEntrar.textContent = "Entrando...";

    const email = campoEmail.value.trim();
    const senha = campoSenha.value;

    try {

        const resposta = await fetch(
            "/api/clinica/auth/login",
            {
                method: "POST",
                credentials: "same-origin",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    senha
                })
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {

            mensagem.textContent =
                dados.mensagem ||
                "E-mail ou senha inválidos.";

            mensagem.hidden = false;

            return;
        }

        // Login autenticado.
        // O servidor deve proteger esta pagina.

        window.location.replace(
            "/admin/dashboard.html"
        );

    } catch (erro) {

        console.error("Falha ao autenticar:", erro);

        mensagem.textContent =
            "Não foi possível conectar ao servidor.";

        mensagem.hidden = false;

    } finally {

        botaoEntrar.disabled = false;
        botaoEntrar.innerHTML = textoBotao;

    }

});
