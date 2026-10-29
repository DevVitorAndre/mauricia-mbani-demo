
/* ============================================
   DRA. MAURÍCIA MBANI
   NAVEGAÇÃO E MENU RESPONSIVO

   Projeto: Protótipo Demonstrativo
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // 1. ELEMENTOS DO MENU
    // ========================================

    const menuToggle = document.querySelector(
        ".menu-toggle"
    );

    const navLinks = document.querySelector(
        ".nav-links"
    );

    // Evita erros em páginas sem esse menu
    if (!menuToggle || !navLinks) {
        return;
    }

    const links = navLinks.querySelectorAll("a");

    const mobileQuery = window.matchMedia(
        "(max-width: 1023px)"
    );


    // ========================================
    // 2. VERIFICAR SE MENU ESTÁ ABERTO
    // ========================================

    function menuAberto() {
        return navLinks.classList.contains("is-open");
    }


    // ========================================
    // 3. ABRIR MENU
    // ========================================

    function abrirMenu() {

        if (!mobileQuery.matches) {
            return;
        }

        navLinks.classList.add("is-open");

        menuToggle.setAttribute(
            "aria-expanded",
            "true"
        );

        menuToggle.setAttribute(
            "aria-label",
            "Fechar menu"
        );

        menuToggle.textContent = "×";

        document.body.classList.add("menu-open");

    }


    // ========================================
    // 4. FECHAR MENU
    // ========================================

    function fecharMenu(devolverFoco = false) {

        const estavaAberto = menuAberto();

        navLinks.classList.remove("is-open");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        menuToggle.setAttribute(
            "aria-label",
            "Abrir menu"
        );

        menuToggle.textContent = "☰";

        document.body.classList.remove("menu-open");

        if (estavaAberto && devolverFoco) {
            menuToggle.focus();
        }

    }


    // ========================================
    // 5. CLIQUE NO BOTÃO HAMBÚRGUER
    // ========================================

    menuToggle.addEventListener("click", () => {

        if (menuAberto()) {
            fecharMenu();
        } else {
            abrirMenu();
        }

    });


    // ========================================
    // 6. FECHAR AO CLICAR NOS LINKS
    // ========================================

    links.forEach((link) => {

        link.addEventListener("click", () => {

            if (mobileQuery.matches) {
                fecharMenu();
            }

        });

    });


    // ========================================
    // 7. FECHAR AO CLICAR FORA
    // ========================================

    document.addEventListener("pointerdown", (event) => {

        if (!menuAberto()) {
            return;
        }

        const clicouNoMenu = navLinks.contains(
            event.target
        );

        const clicouNoBotao = menuToggle.contains(
            event.target
        );

        if (!clicouNoMenu && !clicouNoBotao) {
            fecharMenu();
        }

    });


    // ========================================
    // 8. FECHAR COM ESC
    // ========================================

    document.addEventListener("keydown", (event) => {

        if (
            event.key === "Escape" &&
            menuAberto()
        ) {
            fecharMenu(true);
        }

    });


    // ========================================
    // 9. AJUSTAR AO REDIMENSIONAR A TELA
    // ========================================

    mobileQuery.addEventListener("change", () => {

        fecharMenu();

    });


    // ========================================
    // 10. ESTADO INICIAL
    // ========================================

    fecharMenu();

});


/* =====================================================
   DRA. MAURÍCIA MBANI
   ASSISTENTE VIRTUAL FLUTUANTE

   ADICIONAR AO FINAL DE:
   assets/js/navigation.js

   - Botão flutuante
   - Arrastar com mouse ou toque
   - Abrir e fechar chat
   - Perguntas automáticas
   - Sem API e sem armazenamento
===================================================== */

(() => {
    "use strict";

    const navigationScriptURL =
        document.currentScript?.src || "";

    function iniciarAssistenteFlutuante() {

        // Evita criar o assistente duas vezes.
        if (document.getElementById("mbani-bot-button")) {
            return;
        }

        // Caminhos absolutos baseados no arquivo navigation.js.
        // Funcionam na página inicial e nas páginas internas.

        const caminhoPagina = (arquivo) => {
            return new URL(
                "../../pages/" + arquivo,
                navigationScriptURL || document.baseURI
            ).href;
        };


        /* ==========================================
           1. ESTILOS DO WIDGET
        ========================================== */

        const estilos = document.createElement("style");

        estilos.id = "mbani-bot-styles";

        estilos.textContent = `

            .mbani-bot-button {
                position: fixed;
                right: 24px;
                bottom: 24px;
                z-index: 9998;

                display: flex;
                align-items: center;
                justify-content: center;

                width: 70px;
                height: 70px;

                border: 3px solid #FFFFFF;
                border-radius: 50%;

                background: #45594C;
                color: #FFFFFF;

                box-shadow:
                    0 10px 28px rgba(35, 38, 58, 0.23);

                font-size: 32px;
                line-height: 1;

                cursor: grab;
                user-select: none;
                touch-action: none;

                transition:
                    background 0.2s ease,
                    box-shadow 0.2s ease;
            }

            .mbani-bot-button:hover {
                background: #B76E4F;

                box-shadow:
                    0 14px 34px rgba(35, 38, 58, 0.28);
            }

            .mbani-bot-button:active {
                cursor: grabbing;
            }

            .mbani-bot-button:focus-visible {
                outline: 3px solid #B76E4F;
                outline-offset: 4px;
            }

            .mbani-bot-notification {
                position: absolute;
                top: -2px;
                right: -2px;

                width: 15px;
                height: 15px;

                border: 3px solid #FFFFFF;
                border-radius: 50%;

                background: #B76E4F;
            }


            /* ======================================
               2. JANELA DO CHAT
            ====================================== */

            .mbani-bot-panel {
                position: fixed;
                z-index: 9999;

                display: flex;
                flex-direction: column;

                width: min(370px, calc(100vw - 24px));
                height: min(520px, calc(100dvh - 24px));

                overflow: hidden;

                background: #FFFFFF;

                border: 1px solid #E6DDD2;
                border-radius: 22px;

                box-shadow:
                    0 22px 65px rgba(35, 38, 58, 0.22);

                font-family: "DM Sans", sans-serif;
            }

            .mbani-bot-panel[hidden] {
                display: none !important;
            }

            .mbani-bot-panel *,
            .mbani-bot-panel *::before,
            .mbani-bot-panel *::after {
                box-sizing: border-box;
            }


            /* ======================================
               3. CABEÇALHO
            ====================================== */

            .mbani-bot-header {
                display: flex;
                align-items: center;
                justify-content: space-between;

                gap: 12px;
                padding: 17px;

                background: #23263A;
                color: #FFFFFF;
            }

            .mbani-bot-profile {
                display: flex;
                align-items: center;

                gap: 12px;
                min-width: 0;
            }

            .mbani-bot-avatar {
                display: flex;
                align-items: center;
                justify-content: center;

                width: 43px;
                height: 43px;

                flex-shrink: 0;

                background: #B76E4F;
                border-radius: 13px;

                font-size: 24px;
            }

            .mbani-bot-profile-text {
                display: flex;
                flex-direction: column;
                gap: 4px;

                min-width: 0;
            }

            .mbani-bot-profile-text strong {
                color: #FFFFFF;
                font-size: 14px;
                line-height: 1.3;
            }

            .mbani-bot-profile-text small {
                color: #E8DCD7;
                font-size: 11px;
            }

            .mbani-bot-close {
                display: flex;
                align-items: center;
                justify-content: center;

                width: 34px;
                height: 34px;

                flex-shrink: 0;

                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 10px;

                background: rgba(255,255,255,0.08);
                color: #FFFFFF;

                font-size: 23px;
                cursor: pointer;
            }

            .mbani-bot-close:hover {
                background: rgba(255,255,255,0.2);
            }


            /* ======================================
               4. AVISO DEMONSTRATIVO
            ====================================== */

            .mbani-bot-warning {
                padding: 11px 15px;

                border-bottom: 1px solid #E9DDD0;

                background: #FFF8F1;
                color: #806354;

                font-size: 11px;
                line-height: 1.6;
            }


            /* ======================================
               5. MENSAGENS
            ====================================== */

            .mbani-bot-messages {
                display: flex;
                flex: 1;
                flex-direction: column;

                gap: 14px;

                min-height: 0;
                overflow-y: auto;

                padding: 18px 15px;

                background: #FAF8F5;
                overscroll-behavior: contain;
            }

            .mbani-bot-message {
                display: flex;
                flex-direction: column;

                max-width: 86%;
                gap: 7px;

                align-self: flex-start;
            }

            .mbani-bot-message.user {
                align-self: flex-end;
            }

            .mbani-bot-bubble {
                padding: 12px 14px;

                border: 1px solid #E7DDD2;
                border-radius: 4px 15px 15px 15px;

                background: #FFFFFF;
                color: #353746;

                font-size: 12px;
                line-height: 1.7;

                overflow-wrap: anywhere;
                white-space: pre-wrap;
            }

            .mbani-bot-message.user .mbani-bot-bubble {
                background: #45594C;
                border-color: #45594C;

                color: #FFFFFF;

                border-radius: 15px 4px 15px 15px;
            }

            .mbani-bot-message a {
                display: inline-block;

                padding: 8px 11px;

                border: 1px solid #DAB5A3;
                border-radius: 9px;

                background: #FFF7F0;
                color: #95563D;

                text-decoration: none;
                font-size: 11px;
                font-weight: 700;
                line-height: 1.4;
            }

            .mbani-bot-message a:hover {
                background: #F2E2D7;
            }


            /* ======================================
               6. PERGUNTAS RÁPIDAS
            ====================================== */

            .mbani-bot-quick {
                display: flex;
                flex-wrap: wrap;
                gap: 7px;

                padding: 12px 14px;

                background: #FFFFFF;
                border-top: 1px solid #ECE5DC;
            }

            .mbani-bot-quick button {
                padding: 7px 10px;

                background: #FFF8F2;
                color: #95563D;

                border: 1px solid #E0BDAA;
                border-radius: 20px;

                font-family: inherit;
                font-size: 11px;
                font-weight: 600;

                cursor: pointer;
            }

            .mbani-bot-quick button:hover {
                background: #B76E4F;
                color: #FFFFFF;
            }


            /* ======================================
               7. CAMPO DE DIGITAÇÃO
            ====================================== */

            .mbani-bot-form {
                display: flex;
                align-items: center;

                gap: 8px;
                padding: 12px;

                background: #FFFFFF;
                border-top: 1px solid #ECE5DC;
            }

            .mbani-bot-input {
                flex: 1;

                min-width: 0;
                min-height: 42px;

                padding: 10px 12px;

                border: 1px solid #DDD4CB;
                border-radius: 11px;

                background: #FAF8F5;
                color: #23263A;

                outline: none;

                font-family: inherit;
                font-size: 13px;
            }

            .mbani-bot-input:focus {
                border-color: #B76E4F;
                box-shadow: 0 0 0 3px rgba(183,110,79,0.12);
            }

            .mbani-bot-send {
                display: flex;
                align-items: center;
                justify-content: center;

                width: 43px;
                height: 43px;

                flex-shrink: 0;

                border: none;
                border-radius: 11px;

                background: #23263A;
                color: #FFFFFF;

                font-size: 21px;
                cursor: pointer;
            }

            .mbani-bot-send:hover {
                background: #B76E4F;
            }

            .mbani-bot-footer {
                padding: 0 13px 12px;

                background: #FFFFFF;

                text-align: center;
            }

            .mbani-bot-footer a {
                color: #45594C;

                font-size: 11px;
                font-weight: 700;
                text-decoration: underline;
                text-underline-offset: 3px;
            }


            /* ======================================
               8. RESPONSIVIDADE
            ====================================== */

            @media (max-width: 480px) {

                .mbani-bot-button {
                    width: 62px;
                    height: 62px;

                    right: 15px;
                    bottom: 18px;

                    font-size: 28px;
                }

                .mbani-bot-panel {
                    width: min(370px, calc(100vw - 20px));
                    height: min(500px, calc(100dvh - 24px));

                    border-radius: 17px;
                }

                .mbani-bot-input {
                    font-size: 16px;
                }

            }

            @media (prefers-reduced-motion: reduce) {

                .mbani-bot-button {
                    transition: none;
                }

            }

        `;

        document.head.appendChild(estilos);


        /* ==========================================
           9. ESTRUTURA DO BOTÃO
        ========================================== */

        const botao = document.createElement("button");

        botao.id = "mbani-bot-button";
        botao.className = "mbani-bot-button";

        botao.type = "button";
        botao.setAttribute(
            "aria-label",
            "Abrir assistente virtual"
        );

        botao.setAttribute(
            "aria-expanded",
            "false"
        );

        botao.setAttribute(
            "aria-controls",
            "mbani-bot-panel"
        );

        const emoji = document.createElement("span");
        emoji.textContent = "🤖";
        emoji.setAttribute("aria-hidden", "true");

        const notificacao = document.createElement("span");
        notificacao.className = "mbani-bot-notification";
        notificacao.setAttribute("aria-hidden", "true");

        botao.append(emoji, notificacao);


        /* ==========================================
           10. ESTRUTURA DO CHAT
        ========================================== */

        const painel = document.createElement("section");

        painel.id = "mbani-bot-panel";
        painel.className = "mbani-bot-panel";

        painel.hidden = true;

        painel.setAttribute(
            "aria-label",
            "Conversa com assistente virtual"
        );

        painel.innerHTML = `
            <div class="mbani-bot-header">

                <div class="mbani-bot-profile">

                    <div class="mbani-bot-avatar"
                         aria-hidden="true">
                        🤖
                    </div>

                    <div class="mbani-bot-profile-text">
                        <strong>Assistente Virtual</strong>
                        <small>Dra. Maurícia Mbani • Demo</small>
                    </div>

                </div>

                <button
                    type="button"
                    class="mbani-bot-close"
                    aria-label="Fechar assistente">
                    ×
                </button>

            </div>

            <div class="mbani-bot-warning">
                Assistente demonstrativo.
                Não informe dados pessoais ou de saúde.
            </div>

            <div
                class="mbani-bot-messages"
                role="log"
                aria-live="polite"
                aria-label="Mensagens da conversa">
            </div>

            <div class="mbani-bot-quick">

                <button
                    type="button"
                    data-pergunta="Saúde Capilar">
                    Saúde Capilar
                </button>

                <button
                    type="button"
                    data-pergunta="Clínica Geral">
                    Clínica Geral
                </button>

                <button
                    type="button"
                    data-pergunta="Consulta Online">
                    Consulta Online
                </button>

                <button
                    type="button"
                    data-pergunta="Agendamento">
                    Agendamento
                </button>

            </div>

            <form class="mbani-bot-form">

                <input
                    class="mbani-bot-input"
                    type="text"
                    maxlength="250"
                    placeholder="Digite sua dúvida..."
                    aria-label="Digite sua dúvida"
                    autocomplete="off"
                    required>

                <button
                    class="mbani-bot-send"
                    type="submit"
                    aria-label="Enviar pergunta">
                    →
                </button>

            </form>

            <div class="mbani-bot-footer">
                <a class="mbani-bot-full-link">
                    Abrir página completa do assistente
                </a>
            </div>
        `;

        document.body.append(botao, painel);

        const mensagens = painel.querySelector(
            ".mbani-bot-messages"
        );

        const formulario = painel.querySelector(
            ".mbani-bot-form"
        );

        const campo = painel.querySelector(
            ".mbani-bot-input"
        );

        const fechar = painel.querySelector(
            ".mbani-bot-close"
        );

        const linkCompleto = painel.querySelector(
            ".mbani-bot-full-link"
        );

        linkCompleto.href = caminhoPagina(
            "assistente.html"
        );


        /* ==========================================
           11. EXIBIR MENSAGENS
        ========================================== */

        function adicionarMensagem(
            texto,
            tipo = "bot",
            link = null
        ) {

            const mensagem = document.createElement("div");
            mensagem.className =
                "mbani-bot-message " +
                (tipo === "user" ? "user" : "bot");

            const balao = document.createElement("div");
            balao.className = "mbani-bot-bubble";

            // textContent evita interpretar HTML do usuário.
            balao.textContent = texto;

            mensagem.appendChild(balao);

            if (link && tipo === "bot") {

                const ancora = document.createElement("a");

                ancora.href = caminhoPagina(
                    link.arquivo
                );

                ancora.textContent = link.texto;

                mensagem.appendChild(ancora);
            }

            mensagens.appendChild(mensagem);

            mensagens.scrollTop =
                mensagens.scrollHeight;
        }


        /* ==========================================
           12. RESPOSTAS DEMONSTRATIVAS
        ========================================== */

        function normalizar(texto) {
            return texto
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .trim();
        }

        function obterResposta(pergunta) {

            const texto = normalizar(pergunta);

            // Não oferecer diagnóstico ou atendimento
            // médico personalizado pelo chat.

            if (
                /emergencia|urgencia|dor no peito|falta de ar|desmaio|convulsao/.test(texto)
            ) {
                return {
                    texto:
                        "Este assistente não atende emergências. " +
                        "Se estiver passando por uma situação grave " +
                        "ou tiver sintomas como dor no peito, " +
                        "falta de ar importante ou desmaio, " +
                        "procure atendimento médico imediato."
                };
            }

            if (
                /remedio|medicamento|tratamento|diagnostico|sintoma|exame|doenca|estou sentindo/.test(texto)
            ) {
                return {
                    texto:
                        "Não consigo avaliar sintomas, " +
                        "interpretar exames ou indicar tratamentos. " +
                        "Para orientações individuais, " +
                        "é necessária uma avaliação médica.",
                    link: {
                        arquivo: "agendamento.html",
                        texto: "Conhecer agendamento demonstrativo →"
                    }
                };
            }

            if (
                /pagamento|pix|cartao|preco|valor|custa|cobranca/.test(texto)
            ) {
                return {
                    texto:
                        "O site é um protótipo. " +
                        "Os valores apresentados são ilustrativos " +
                        "e não representam os preços reais da médica. " +
                        "Nenhum pagamento ou cobrança é realizado."
                };
            }

            if (
                /capilar|cabelo|queda|couro cabeludo|tricologia/.test(texto)
            ) {
                return {
                    texto:
                        "A página de Saúde Capilar apresenta " +
                        "informações gerais sobre avaliação " +
                        "de queixas relacionadas aos cabelos " +
                        "e ao couro cabeludo.",
                    link: {
                        arquivo: "saude-capilar.html",
                        texto: "Conhecer Saúde Capilar →"
                    }
                };
            }

            if (
                /clinica|geral|consulta medica/.test(texto)
            ) {
                return {
                    texto:
                        "A página de Clínica Geral apresenta " +
                        "a proposta de avaliação de sintomas, " +
                        "orientações preventivas e acompanhamento " +
                        "clínico individualizado.",
                    link: {
                        arquivo: "clinica-geral.html",
                        texto: "Conhecer Clínica Geral →"
                    }
                };
            }

            if (
                /online|video|teleconsulta|distancia/.test(texto)
            ) {
                return {
                    texto:
                        "A consulta online é um atendimento " +
                        "médico remoto por videochamada, " +
                        "quando adequado à necessidade clínica. " +
                        "O protótipo ainda não realiza videochamadas.",
                    link: {
                        arquivo: "consulta-online.html",
                        texto: "Conhecer Consulta Online →"
                    }
                };
            }

            if (
                /agenda|horario|marcar|reservar|consulta/.test(texto)
            ) {
                return {
                    texto:
                        "Você pode experimentar nosso agendamento " +
                        "demonstrativo, escolhendo um atendimento, " +
                        "uma modalidade, uma data e um horário. " +
                        "Nenhuma consulta real será reservada.",
                    link: {
                        arquivo: "agendamento.html",
                        texto: "Simular agendamento →"
                    }
                };
            }

            if (
                /endereco|local|onde fica|porto alegre|presencial/.test(texto)
            ) {
                return {
                    texto:
                        "O site apresenta Porto Alegre - RS " +
                        "como cidade de referência para o " +
                        "atendimento presencial. " +
                        "O endereço exato ainda precisa " +
                        "ser confirmado.",
                    link: {
                        arquivo: "contato.html",
                        texto: "Ver página de Contato →"
                    }
                };
            }

            if (
                /contato|whatsapp|telefone|email|falar/.test(texto)
            ) {
                return {
                    texto:
                        "Os canais oficiais de contato " +
                        "ainda serão confirmados. " +
                        "Você pode conhecer a página " +
                        "demonstrativa de Contato.",
                    link: {
                        arquivo: "contato.html",
                        texto: "Ir para Contato →"
                    }
                };
            }

            if (
                /oi|ola|bom dia|boa tarde|boa noite/.test(texto)
            ) {
                return {
                    texto:
                        "Olá! Seja bem-vindo(a)! " +
                        "Posso explicar como funcionam " +
                        "as páginas de Saúde Capilar, " +
                        "Clínica Geral, Consulta Online " +
                        "e o agendamento demonstrativo."
                };
            }

            return {
                texto:
                    "Posso ajudar com informações gerais " +
                    "sobre os serviços e a navegação do site. " +
                    "Experimente os botões de perguntas rápidas " +
                    "ou reformule sua dúvida. " +
                    "Não realizo avaliações médicas."
            };
        }


        /* ==========================================
           13. ENVIAR PERGUNTA
        ========================================== */

        function perguntar(texto) {

            const pergunta = texto.trim().slice(0, 250);

            if (!pergunta) {
                return;
            }

            adicionarMensagem(pergunta, "user");

            const resposta = obterResposta(pergunta);

            adicionarMensagem(
                resposta.texto,
                "bot",
                resposta.link || null
            );
        }

        formulario.addEventListener(
            "submit",
            (evento) => {

                evento.preventDefault();

                const pergunta = campo.value;

                campo.value = "";

                perguntar(pergunta);
            }
        );

        painel.querySelectorAll(
            "[data-pergunta]"
        ).forEach((botaoRapido) => {

            botaoRapido.addEventListener(
                "click",
                () => {

                    perguntar(
                        botaoRapido.dataset.pergunta
                    );
                }
            );
        });


        /* ==========================================
           14. POSICIONAR JANELA PERTO DO ROBÔ
        ========================================== */

        function posicionarPainel() {

            if (painel.hidden) {
                return;
            }

            const robo = botao.getBoundingClientRect();

            const largura = painel.offsetWidth;
            const altura = painel.offsetHeight;

            const margem = 10;

            let esquerda = robo.right - largura;

            esquerda = Math.max(
                margem,
                Math.min(
                    esquerda,
                    window.innerWidth - largura - margem
                )
            );

            let topo = robo.top - altura - 12;

            if (topo < margem) {
                topo = robo.bottom + 12;
            }

            if (
                topo + altura >
                window.innerHeight - margem
            ) {
                topo = Math.max(
                    margem,
                    window.innerHeight - altura - margem
                );
            }

            painel.style.left = esquerda + "px";
            painel.style.top = topo + "px";
        }


        /* ==========================================
           15. ABRIR E FECHAR ASSISTENTE
        ========================================== */

        function abrirAssistente() {

            painel.hidden = false;

            botao.setAttribute(
                "aria-expanded",
                "true"
            );

            notificacao.hidden = true;

            posicionarPainel();

            campo.focus();
        }

        function fecharAssistente() {

            painel.hidden = true;

            botao.setAttribute(
                "aria-expanded",
                "false"
            );

            botao.focus();
        }

        fechar.addEventListener(
            "click",
            fecharAssistente
        );

        document.addEventListener(
            "keydown",
            (evento) => {

                if (
                    evento.key === "Escape" &&
                    !painel.hidden
                ) {
                    fecharAssistente();
                }
            }
        );

        window.addEventListener(
            "resize",
            posicionarPainel
        );


        /* ==========================================
           16. ARRASTAR O ROBÔ

           - Clique: abre o chat.
           - Arrastar: reposiciona o robô.
           - Soltar após arrastar: não abre o chat.
        ========================================== */

        let inicioX = 0;
        let inicioY = 0;

        let origemX = 0;
        let origemY = 0;

        let arrastando = false;
        let movimentoAtivo = false;
        let ignorarClique = false;

        botao.addEventListener(
            "pointerdown",
            (evento) => {

                if (
                    evento.pointerType === "mouse" &&
                    evento.button !== 0
                ) {
                    return;
                }

                arrastando = true;
                movimentoAtivo = false;

                inicioX = evento.clientX;
                inicioY = evento.clientY;

                const posicao =
                    botao.getBoundingClientRect();

                origemX = posicao.left;
                origemY = posicao.top;

                botao.setPointerCapture(
                    evento.pointerId
                );
            }
        );

        botao.addEventListener(
            "pointermove",
            (evento) => {

                if (!arrastando) {
                    return;
                }

                const diferencaX =
                    evento.clientX - inicioX;

                const diferencaY =
                    evento.clientY - inicioY;

                if (
                    Math.hypot(
                        diferencaX,
                        diferencaY
                    ) > 7
                ) {
                    movimentoAtivo = true;
                }

                if (!movimentoAtivo) {
                    return;
                }

                const margem = 8;

                const largura =
                    botao.offsetWidth;

                const altura =
                    botao.offsetHeight;

                const novoX = Math.max(
                    margem,
                    Math.min(
                        origemX + diferencaX,
                        window.innerWidth -
                        largura - margem
                    )
                );

                const novoY = Math.max(
                    margem,
                    Math.min(
                        origemY + diferencaY,
                        window.innerHeight -
                        altura - margem
                    )
                );

                botao.style.left = novoX + "px";
                botao.style.top = novoY + "px";

                botao.style.right = "auto";
                botao.style.bottom = "auto";

                posicionarPainel();
            }
        );

        function finalizarArraste() {

            if (!arrastando) {
                return;
            }

            arrastando = false;

            if (movimentoAtivo) {
                ignorarClique = true;
            }
        }

        botao.addEventListener(
            "pointerup",
            finalizarArraste
        );

        botao.addEventListener(
            "pointercancel",
            finalizarArraste
        );

        botao.addEventListener(
            "click",
            () => {

                if (ignorarClique) {
                    ignorarClique = false;
                    return;
                }

                if (painel.hidden) {
                    abrirAssistente();
                } else {
                    fecharAssistente();
                }
            }
        );


        /* ==========================================
           17. MENSAGEM DE BOAS-VINDAS
        ========================================== */

        adicionarMensagem(
            "Olá! 👋 Sou o assistente virtual " +
            "demonstrativo da Dra. Maurícia Mbani.\n\n" +
            "Posso ajudar com informações sobre " +
            "Saúde Capilar, Clínica Geral, " +
            "Consulta Online e agendamentos.\n\n" +
            "Escolha um assunto abaixo!"
        );
    }


    /* ==========================================
       18. INICIALIZAÇÃO
    ========================================== */

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            iniciarAssistenteFlutuante,
            { once: true }
        );

    } else {

        iniciarAssistenteFlutuante();
    }

})();
