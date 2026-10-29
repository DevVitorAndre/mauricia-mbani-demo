
/* =====================================================
   DRA. MAURÍCIA MBANI
   DASHBOARD ADMINISTRATIVO

   ARQUIVO: assets/js/dashboard.js

   FUNCIONALIDADES:
   - Menu lateral responsivo
   - Abertura e fechamento do menu
   - Fundo escurecido no celular
   - Fechar pela tecla ESC
   - Fechar ao selecionar um link
   - Exibir data atual
   - Melhorias de acessibilidade

   PROTÓTIPO - SEM AUTENTICAÇÃO REAL
===================================================== */

(() => {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {

        /* ==========================================
           1. ELEMENTOS DO DASHBOARD
        ========================================== */

        const sidebar = document.getElementById(
            "admin-sidebar"
        );

        const botaoMenu = document.getElementById(
            "admin-menu-toggle"
        );

        const overlay = document.getElementById(
            "admin-sidebar-overlay"
        );

        const conteudo = document.querySelector(
            ".admin-content"
        );

        if (
            !sidebar ||
            !botaoMenu ||
            !overlay ||
            !conteudo
        ) {
            console.warn(
                "Dashboard: elementos necessários não encontrados."
            );

            return;
        }


        /* ==========================================
           2. CONFIGURAÇÃO RESPONSIVA
        ========================================== */

        const limiteMobile = window.matchMedia(
            "(max-width: 900px)"
        );

        let menuAberto = false;

        // Guarda o elemento que estava em foco
        // antes da abertura do menu.

        let focoAnterior = null;


        /* ==========================================
           3. ATUALIZAR ESTADO DO BOTÃO
        ========================================== */

        function atualizarBotao() {

            botaoMenu.setAttribute(
                "aria-expanded",
                String(menuAberto)
            );

            botaoMenu.setAttribute(
                "aria-label",
                menuAberto
                    ? "Fechar menu administrativo"
                    : "Abrir menu administrativo"
            );

        }


        /* ==========================================
           4. ABRIR MENU MOBILE
        ========================================== */

        function abrirMenu() {

            if (!limiteMobile.matches) {
                return;
            }

            focoAnterior = document.activeElement;

            menuAberto = true;

            sidebar.classList.add("is-open");

            overlay.hidden = false;

            // Garante acesso aos links quando
            // o menu fica visível.

            sidebar.removeAttribute("inert");

            atualizarBotao();

            const primeiroLink = sidebar.querySelector(
                ".admin-sidebar-nav a"
            );

            if (primeiroLink) {
                primeiroLink.focus();
            }

        }


        /* ==========================================
           5. FECHAR MENU MOBILE
        ========================================== */

        function fecharMenu(devolverFoco = true) {

            menuAberto = false;

            sidebar.classList.remove("is-open");

            overlay.hidden = true;

            atualizarBotao();

            if (limiteMobile.matches) {

                // Move o foco antes de tornar
                // os links inacessíveis.

                if (devolverFoco && focoAnterior) {
                    focoAnterior.focus();
                }

                sidebar.setAttribute("inert", "");

            } else {

                sidebar.removeAttribute("inert");
            }

        }


        /* ==========================================
           6. CLIQUE NO BOTÃO HAMBÚRGUER
        ========================================== */

        botaoMenu.addEventListener(
            "click",
            () => {

                if (menuAberto) {
                    fecharMenu();
                } else {
                    abrirMenu();
                }

            }
        );


        /* ==========================================
           7. CLIQUE NO FUNDO ESCURECIDO
        ========================================== */

        overlay.addEventListener(
            "click",
            () => {

                fecharMenu();

            }
        );


        /* ==========================================
           8. TECLA ESCAPE
        ========================================== */

        document.addEventListener(
            "keydown",
            (evento) => {

                if (
                    evento.key === "Escape" &&
                    menuAberto
                ) {

                    fecharMenu();

                }

            }
        );


        /* ==========================================
           9. NAVEGAÇÃO COM TECLADO

           Mantém o foco dentro do menu quando
           ele está aberto em telas menores.
        ========================================== */

        sidebar.addEventListener(
            "keydown",
            (evento) => {

                if (
                    evento.key !== "Tab" ||
                    !menuAberto
                ) {
                    return;
                }

                const elementos = Array.from(
                    sidebar.querySelectorAll(
                        'a[href], button:not([disabled])'
                    )
                ).filter(elemento => {
                    return elemento.getClientRects().length > 0;
                });

                if (elementos.length === 0) {
                    return;
                }

                const primeiro = elementos[0];

                const ultimo = elementos[
                    elementos.length - 1
                ];

                if (
                    evento.shiftKey &&
                    document.activeElement === primeiro
                ) {

                    evento.preventDefault();

                    ultimo.focus();

                } else if (
                    !evento.shiftKey &&
                    document.activeElement === ultimo
                ) {

                    evento.preventDefault();

                    primeiro.focus();

                }

            }
        );


        /* ==========================================
           10. FECHAR AO CLICAR EM LINKS
        ========================================== */

        sidebar.querySelectorAll(
            "a[href]"
        ).forEach((link) => {

            link.addEventListener(
                "click",
                () => {

                    if (limiteMobile.matches) {
                        fecharMenu(false);
                    }

                }
            );

        });


        /* ==========================================
           11. AJUSTAR AO REDIMENSIONAR
        ========================================== */

        function ajustarResponsividade() {

            if (limiteMobile.matches) {

                if (!menuAberto) {

                    sidebar.setAttribute(
                        "inert",
                        ""
                    );

                }

            } else {

                menuAberto = false;

                sidebar.classList.remove(
                    "is-open"
                );

                sidebar.removeAttribute(
                    "inert"
                );

                overlay.hidden = true;

                atualizarBotao();

            }

        }

        limiteMobile.addEventListener(
            "change",
            ajustarResponsividade
        );

        ajustarResponsividade();


        /* ==========================================
           12. DATA ATUAL NO CABEÇALHO
        ========================================== */

        function adicionarDataAtual() {

            const cabecalho = document.querySelector(
                ".admin-page-heading > div"
            );

            if (!cabecalho) {
                return;
            }

            if (
                document.getElementById(
                    "admin-current-date"
                )
            ) {
                return;
            }

            const data = new Date();

            const formato = new Intl.DateTimeFormat(
                "pt-BR",
                {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            );

            const elemento = document.createElement(
                "p"
            );

            elemento.id = "admin-current-date";

            elemento.textContent =
                "Data de acesso: " +
                formato.format(data);

            elemento.style.marginTop = "12px";

            elemento.style.color = "#45594C";

            elemento.style.fontSize = "0.78rem";

            elemento.style.fontWeight = "600";

            cabecalho.appendChild(elemento);

        }

        adicionarDataAtual();


        /* ==========================================
           13. IDENTIFICAR LINKS DO PAINEL

           As outras páginas administrativas
           serão criadas nas próximas etapas.
        ========================================== */

        const linksAdministrativos =
            document.querySelectorAll(
                ".admin-sidebar-nav .admin-nav-link"
            );

        linksAdministrativos.forEach((link) => {

            if (
                link.getAttribute(
                    "aria-current"
                ) === "page"
            ) {

                link.classList.add(
                    "is-active"
                );

            }

        });


        /* ==========================================
           14. INICIALIZAÇÃO
        ========================================== */

        console.log(
            "Dashboard administrativo " +
            "demonstrativo inicializado."
        );

    });

})();
