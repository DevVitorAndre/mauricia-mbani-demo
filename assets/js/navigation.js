
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
