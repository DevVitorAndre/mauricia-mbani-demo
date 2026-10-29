
/* =====================================================
   DRA. MAURÍCIA MBANI
   LOGIN ADMINISTRATIVO DEMONSTRATIVO

   ARQUIVO: assets/js/login-demo.js

   FUNCIONALIDADES:
   - Preencher credenciais de teste
   - Mostrar e ocultar senha
   - Validar campos
   - Verificar credenciais fictícias
   - Exibir mensagens de erro ou sucesso
   - Não armazenar senhas

   ATENÇÃO:
   Não é um sistema de autenticação real.
===================================================== */

(() => {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {

        /* ==========================================
           1. ELEMENTOS DA PÁGINA
        ========================================== */

        const formulario = document.getElementById(
            "admin-login-form"
        );

        const usuario = document.getElementById(
            "admin-user"
        );

        const senha = document.getElementById(
            "admin-password"
        );

        const botaoPreencher = document.getElementById(
            "admin-fill-demo"
        );

        const botaoMostrarSenha = document.getElementById(
            "admin-toggle-password"
        );

        const botaoEntrar = document.getElementById(
            "admin-login-submit"
        );

        const mensagem = document.getElementById(
            "admin-login-message"
        );


        /* ==========================================
           2. VERIFICAÇÃO DOS ELEMENTOS
        ========================================== */

        if (
            !formulario ||
            !usuario ||
            !senha ||
            !botaoPreencher ||
            !botaoMostrarSenha ||
            !botaoEntrar ||
            !mensagem
        ) {

            console.warn(
                "Login demonstrativo: " +
                "elementos necessários não encontrados."
            );

            return;
        }


        /* ==========================================
           3. CREDENCIAIS FICTÍCIAS

           São públicas e servem apenas
           para demonstrar a interface.
        ========================================== */

        const USUARIO_DEMO = "demo";
        const SENHA_DEMO = "demo123";


        /* ==========================================
           4. EXIBIR MENSAGENS
        ========================================== */

        function mostrarMensagem(texto, tipo = "error") {

            mensagem.textContent = texto;

            mensagem.classList.remove(
                "is-error",
                "is-success"
            );

            if (tipo === "success") {

                mensagem.classList.add(
                    "is-success"
                );

            } else {

                mensagem.classList.add(
                    "is-error"
                );
            }

            mensagem.hidden = false;
        }


        /* ==========================================
           5. LIMPAR MENSAGEM
        ========================================== */

        function limparMensagem() {

            mensagem.textContent = "";

            mensagem.hidden = true;

            mensagem.classList.remove(
                "is-error",
                "is-success"
            );
        }


        /* ==========================================
           6. LIMPAR ERRO AO DIGITAR
        ========================================== */

        usuario.addEventListener("input", () => {

            limparMensagem();

            usuario.removeAttribute(
                "aria-invalid"
            );

        });

        senha.addEventListener("input", () => {

            limparMensagem();

            senha.removeAttribute(
                "aria-invalid"
            );

        });


        /* ==========================================
           7. PREENCHER DADOS DEMONSTRATIVOS
        ========================================== */

        botaoPreencher.addEventListener(
            "click",
            () => {

                usuario.value = USUARIO_DEMO;
                senha.value = SENHA_DEMO;

                limparMensagem();

                usuario.removeAttribute(
                    "aria-invalid"
                );

                senha.removeAttribute(
                    "aria-invalid"
                );

                mostrarMensagem(
                    "Credenciais fictícias preenchidas! " +
                    "Clique em Entrar no painel demonstrativo.",
                    "success"
                );

                botaoEntrar.focus();
            }
        );


        /* ==========================================
           8. MOSTRAR OU OCULTAR SENHA
        ========================================== */

        botaoMostrarSenha.addEventListener(
            "click",
            () => {

                const senhaEstaOculta =
                    senha.type === "password";

                senha.type = senhaEstaOculta
                    ? "text"
                    : "password";

                botaoMostrarSenha.textContent =
                    senhaEstaOculta
                        ? "Ocultar"
                        : "Mostrar";

                botaoMostrarSenha.setAttribute(
                    "aria-label",
                    senhaEstaOculta
                        ? "Ocultar senha"
                        : "Mostrar senha"
                );

                botaoMostrarSenha.setAttribute(
                    "aria-pressed",
                    String(senhaEstaOculta)
                );

                senha.focus();

            }
        );


        /* ==========================================
           9. VALIDAR FORMULÁRIO
        ========================================== */

        function validarFormulario() {

            const nomeUsuario =
                usuario.value.trim();

            const senhaInformada =
                senha.value;

            limparMensagem();

            usuario.removeAttribute(
                "aria-invalid"
            );

            senha.removeAttribute(
                "aria-invalid"
            );


            /* USUÁRIO VAZIO */

            if (!nomeUsuario) {

                mostrarMensagem(
                    "Informe o usuário de demonstração."
                );

                usuario.setAttribute(
                    "aria-invalid",
                    "true"
                );

                usuario.focus();

                return false;
            }


            /* SENHA VAZIA */

            if (!senhaInformada) {

                mostrarMensagem(
                    "Informe a senha de demonstração."
                );

                senha.setAttribute(
                    "aria-invalid",
                    "true"
                );

                senha.focus();

                return false;
            }


            /* CREDENCIAIS INVÁLIDAS */

            if (
                nomeUsuario !== USUARIO_DEMO ||
                senhaInformada !== SENHA_DEMO
            ) {

                mostrarMensagem(
                    "Credenciais demonstrativas incorretas. " +
                    "Utilize o usuário demo e a senha demo123."
                );

                usuario.setAttribute(
                    "aria-invalid",
                    "true"
                );

                senha.setAttribute(
                    "aria-invalid",
                    "true"
                );

                return false;
            }

            return true;
        }


        /* ==========================================
           10. PROCESSAR LOGIN
        ========================================== */

        formulario.addEventListener(
            "submit",
            (evento) => {

                evento.preventDefault();

                const dadosValidos =
                    validarFormulario();

                if (!dadosValidos) {
                    return;
                }


                /* ----------------------------------
                   LOGIN DEMONSTRATIVO VÁLIDO
                ---------------------------------- */

                mostrarMensagem(
                    "Acesso demonstrativo validado! " +
                    "As credenciais fictícias estão corretas. " +
                    "O Dashboard Administrativo será " +
                    "conectado na próxima etapa.",
                    "success"
                );


                /* ----------------------------------
                   LIMPAR A SENHA DA INTERFACE
                ---------------------------------- */

                senha.value = "";
                senha.type = "password";

                botaoMostrarSenha.textContent =
                    "Mostrar";

                botaoMostrarSenha.setAttribute(
                    "aria-label",
                    "Mostrar senha"
                );

                botaoMostrarSenha.setAttribute(
                    "aria-pressed",
                    "false"
                );


                /* ----------------------------------
                   PRÓXIMA ETAPA

                   Depois de desenvolvermos
                   admin/dashboard.html,
                   ativaremos o redirecionamento.

                   IMPORTANTE:
                   Este fluxo será apenas
                   visual e demonstrativo.
                ---------------------------------- */

                window.location.assign("dashboard.html");

            }
        );


        /* ==========================================
           11. INICIALIZAÇÃO
        ========================================== */

        limparMensagem();

        console.log(
            "Login administrativo demonstrativo iniciado."
        );

    });

})();
