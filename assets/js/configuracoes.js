
/* =====================================================
   DRA. MAURÍCIA MBANI
   CONFIGURAÇÕES ADMINISTRATIVAS

   ARQUIVO: assets/js/configuracoes.js

   FUNCIONALIDADES:
   - Ativar/desativar dias de atendimento
   - Atualizar rótulos Ativo/Inativo
   - Habilitar/desabilitar horários
   - Validar intervalos de atendimento
   - Gerenciar preferências demonstrativas
   - Identificar alterações no formulário
   - Salvar simulação em memória
   - Restaurar valores de exemplo
   - Navegação interna entre seções

   IMPORTANTE:
   - Sem banco de dados
   - Sem localStorage
   - Sem comunicação com servidor
   - Não altera a agenda real
   - Não envia notificações
===================================================== */

(() => {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {

        /* ==========================================
           1. ELEMENTOS PRINCIPAIS
        ========================================== */

        const elementos = {

            formulario: document.getElementById(
                "settings-form"
            ),

            nome: document.getElementById(
                "settings-public-name"
            ),

            especialidade: document.getElementById(
                "settings-specialty"
            ),

            descricao: document.getElementById(
                "settings-description"
            ),

            salvar: document.getElementById(
                "settings-save-button"
            ),

            restaurar: document.getElementById(
                "settings-reset-button"
            ),

            mensagem: document.getElementById(
                "settings-form-message"
            ),

            painelSalvar: document.querySelector(
                ".settings-save-panel"
            ),

            navegacao: document.querySelector(
                ".settings-navigation"
            )

        };


        /* ==========================================
           2. VALIDAR ESTRUTURA
        ========================================== */

        const ausentes = Object.entries(elementos)
            .filter(([, elemento]) => !elemento)
            .map(([nome]) => nome);

        if (ausentes.length > 0) {

            console.warn(
                "Configurações: elementos ausentes:",
                ausentes
            );

            return;
        }


        /* ==========================================
           3. DIAS DA SEMANA
        ========================================== */

        const dias = [

            {
                nome: "Segunda-feira",
                checkbox: "settings-day-monday",
                inicio: "settings-monday-start",
                fim: "settings-monday-end"
            },

            {
                nome: "Terça-feira",
                checkbox: "settings-day-tuesday",
                inicio: "settings-tuesday-start",
                fim: "settings-tuesday-end"
            },

            {
                nome: "Quarta-feira",
                checkbox: "settings-day-wednesday",
                inicio: "settings-wednesday-start",
                fim: "settings-wednesday-end"
            },

            {
                nome: "Quinta-feira",
                checkbox: "settings-day-thursday",
                inicio: "settings-thursday-start",
                fim: "settings-thursday-end"
            },

            {
                nome: "Sexta-feira",
                checkbox: "settings-day-friday",
                inicio: "settings-friday-start",
                fim: "settings-friday-end"
            },

            {
                nome: "Sábado",
                checkbox: "settings-day-saturday",
                inicio: "settings-saturday-start",
                fim: "settings-saturday-end"
            },

            {
                nome: "Domingo",
                checkbox: "settings-day-sunday",
                inicio: "settings-sunday-start",
                fim: "settings-sunday-end"
            }

        ].map((dia) => {

            return {

                nome: dia.nome,

                checkbox: document.getElementById(
                    dia.checkbox
                ),

                inicio: document.getElementById(
                    dia.inicio
                ),

                fim: document.getElementById(
                    dia.fim
                )

            };

        });


        /* ==========================================
           4. NOTIFICAÇÕES DEMONSTRATIVAS
        ========================================== */

        const notificacoes = [

            document.getElementById(
                "settings-notify-booking"
            ),

            document.getElementById(
                "settings-notify-cancellation"
            ),

            document.getElementById(
                "settings-notify-payment"
            ),

            document.getElementById(
                "settings-notify-reminder"
            )

        ];


        /* ==========================================
           5. CONFERIR CONTROLES
        ========================================== */

        const controlesFaltantes = [

            ...dias.flatMap((dia) => [
                dia.checkbox,
                dia.inicio,
                dia.fim
            ]),

            ...notificacoes

        ].filter((controle) => !controle);

        if (controlesFaltantes.length > 0) {

            console.warn(
                "Configurações: alguns controles " +
                "não foram encontrados no HTML."
            );

            return;
        }


        /* ==========================================
           6. FUNÇÕES AUXILIARES
        ========================================== */

        function limparEspacos(texto) {

            return String(texto)
                .replace(/\s+/g, " ")
                .trim();

        }


        function mostrarMensagem(
            texto,
            tipo = "success"
        ) {

            elementos.mensagem.textContent = texto;

            elementos.mensagem.hidden = false;

            elementos.mensagem.classList.remove(
                "is-success",
                "is-error"
            );

            elementos.mensagem.classList.add(
                tipo === "error"
                    ? "is-error"
                    : "is-success"
            );

        }


        function ocultarMensagem() {

            elementos.mensagem.hidden = true;

            elementos.mensagem.textContent = "";

            elementos.mensagem.classList.remove(
                "is-success",
                "is-error"
            );

        }


        /* ==========================================
           7. ATUALIZAR VISUAL DOS INTERRUPTORES
        ========================================== */

        function atualizarInterruptor(checkbox) {

            const container = checkbox.closest(
                ".settings-switch"
            );

            if (!container) {
                return;
            }

            const rotulo = container.querySelector(
                ".settings-switch-label"
            );

            if (!rotulo) {
                return;
            }

            rotulo.textContent = checkbox.checked
                ? "Ativo"
                : "Inativo";

        }


        /* ==========================================
           8. ATUALIZAR DIA DE ATENDIMENTO
        ========================================== */

        function atualizarDia(dia) {

            const ativo = dia.checkbox.checked;

            // Campos de horários são
            // desabilitados em dias inativos.

            dia.inicio.disabled = !ativo;

            dia.fim.disabled = !ativo;

            atualizarInterruptor(
                dia.checkbox
            );

            const linha = dia.checkbox.closest(
                ".settings-schedule-row"
            );

            if (linha) {

                linha.classList.toggle(
                    "is-inactive",
                    !ativo
                );

            }

        }


        /* ==========================================
           9. ATUALIZAR TODAS AS PREFERÊNCIAS
        ========================================== */

        function atualizarControles() {

            dias.forEach((dia) => {

                atualizarDia(dia);

            });

            notificacoes.forEach((checkbox) => {

                atualizarInterruptor(
                    checkbox
                );

            });

        }


        /* ==========================================
           10. CAPTURAR O ESTADO DO FORMULÁRIO

           Essa função identifica alterações.

           Os valores são mantidos somente
           na memória da página.
        ========================================== */

        function capturarEstado() {

            const campos =
                elementos.formulario.querySelectorAll(
                    "input, select, textarea"
                );

            const estado = {};

            campos.forEach((campo) => {

                if (!campo.id) {
                    return;
                }

                if (campo.type === "checkbox") {

                    estado[campo.id] =
                        campo.checked;

                } else {

                    estado[campo.id] =
                        campo.value;

                }

            });

            return JSON.stringify(estado);

        }


        /* ==========================================
           11. ESTADO INICIAL E ESTADO SALVO

           original: valores do HTML.

           salvo: último estado confirmado
           durante a simulação.
        ========================================== */

        atualizarControles();

        const estadoOriginal =
            capturarEstado();

        let estadoSalvo =
            estadoOriginal;


        /* ==========================================
           12. ATUALIZAR BOTÕES DE SALVAMENTO
        ========================================== */

        function atualizarEstadoAlteracoes() {

            const estadoAtual =
                capturarEstado();

            const alteradoDesdeSalvamento =
                estadoAtual !== estadoSalvo;

            const alteradoDesdeOriginal =
                estadoAtual !== estadoOriginal;


            /* BOTÃO SALVAR */

            elementos.salvar.disabled =
                !alteradoDesdeSalvamento;


            /* BOTÃO RESTAURAR */

            elementos.restaurar.disabled =
                !alteradoDesdeOriginal;


            /* DESTAQUE DO PAINEL */

            elementos.painelSalvar.classList.toggle(
                "has-changes",
                alteradoDesdeSalvamento
            );

        }


        /* ==========================================
           13. VALIDAÇÃO DOS HORÁRIOS
        ========================================== */

        function validarHorarios() {

            for (const dia of dias) {

                // Dias inativos não precisam
                // de validação de horário.

                if (!dia.checkbox.checked) {
                    continue;
                }

                const inicio =
                    dia.inicio.value;

                const fim =
                    dia.fim.value;


                /* HORÁRIO OBRIGATÓRIO */

                if (!inicio || !fim) {

                    mostrarMensagem(
                        "Informe o início e o fim " +
                        "do atendimento de " +
                        dia.nome + ".",
                        "error"
                    );

                    (
                        !inicio
                            ? dia.inicio
                            : dia.fim
                    ).focus();

                    return false;

                }


                /* HORÁRIO FINAL POSTERIOR */

                if (fim <= inicio) {

                    mostrarMensagem(
                        "O horário final de " +
                        dia.nome +
                        " deve ser posterior " +
                        "ao horário inicial.",
                        "error"
                    );

                    dia.fim.focus();

                    return false;

                }

            }

            return true;

        }


        /* ==========================================
           14. VALIDAR IDENTIDADE
        ========================================== */

        function validarIdentidade() {

            const nome = limparEspacos(
                elementos.nome.value
            );

            const descricao =
                elementos.descricao.value.trim();


            if (!nome) {

                mostrarMensagem(
                    "Informe um nome de apresentação.",
                    "error"
                );

                elementos.nome.focus();

                return false;

            }


            if (nome.length > 80) {

                mostrarMensagem(
                    "O nome deve conter no máximo " +
                    "80 caracteres.",
                    "error"
                );

                elementos.nome.focus();

                return false;

            }


            if (!descricao) {

                mostrarMensagem(
                    "Informe uma descrição " +
                    "demonstrativa.",
                    "error"
                );

                elementos.descricao.focus();

                return false;

            }


            if (descricao.length > 250) {

                mostrarMensagem(
                    "A descrição deve conter no " +
                    "máximo 250 caracteres.",
                    "error"
                );

                elementos.descricao.focus();

                return false;

            }


            /* NORMALIZAR TEXTOS */

            elementos.nome.value = nome;

            elementos.descricao.value =
                descricao;

            return true;

        }


        /* ==========================================
           15. EVENTOS DE ALTERAÇÃO
        ========================================== */

        function aoAlterarFormulario() {

            atualizarControles();

            atualizarEstadoAlteracoes();

            ocultarMensagem();

        }


        elementos.formulario.addEventListener(
            "input",
            aoAlterarFormulario
        );

        elementos.formulario.addEventListener(
            "change",
            aoAlterarFormulario
        );


        /* ==========================================
           16. SALVAR CONFIGURAÇÕES DEMONSTRATIVAS
        ========================================== */

        elementos.formulario.addEventListener(
            "submit",
            (evento) => {

                evento.preventDefault();

                ocultarMensagem();


                /* VALIDAR CAMPOS HTML */

                if (
                    !elementos.formulario.checkValidity()
                ) {

                    elementos.formulario.reportValidity();

                    return;
                }


                /* VALIDAR IDENTIDADE */

                if (!validarIdentidade()) {
                    return;
                }


                /* VALIDAR HORÁRIOS */

                if (!validarHorarios()) {
                    return;
                }


                /* ATUALIZAR ESTADO SALVO */

                estadoSalvo =
                    capturarEstado();


                /* ATUALIZAR BOTÕES */

                atualizarEstadoAlteracoes();


                /* MENSAGEM DE SUCESSO */

                mostrarMensagem(
                    "Configurações demonstrativas " +
                    "salvas nesta página! " +
                    "Nenhuma alteração foi enviada " +
                    "ao servidor ou aplicada ao site.",
                    "success"
                );

            }
        );


        /* ==========================================
           17. RESTAURAR VALORES INICIAIS
        ========================================== */

        elementos.restaurar.addEventListener(
            "click",
            () => {

                /* RESTAURAR DEFAULTS DO HTML */

                elementos.formulario.reset();


                /* RESTAURAR ESTADO DE REFERÊNCIA */

                estadoSalvo =
                    estadoOriginal;


                /* REORGANIZAR INTERRUPTORES */

                atualizarControles();


                /* RESTAURAR BOTÕES */

                atualizarEstadoAlteracoes();


                /* AVISAR USUÁRIO */

                mostrarMensagem(
                    "Valores demonstrativos " +
                    "restaurados com sucesso. " +
                    "As preferências voltaram " +
                    "aos exemplos iniciais.",
                    "success"
                );

            }
        );


        /* ==========================================
           18. NAVEGAÇÃO INTERNA DAS SEÇÕES
        ========================================== */

        const linksNavegacao =
            elementos.navegacao.querySelectorAll(
                'a[href^="#"]'
            );


        function atualizarNavegacao() {

            const hash =
                window.location.hash ||
                "#settings-identity";

            linksNavegacao.forEach((link) => {

                const ativo =
                    link.getAttribute("href") === hash;

                link.classList.toggle(
                    "is-active",
                    ativo
                );

                if (ativo) {

                    link.setAttribute(
                        "aria-current",
                        "location"
                    );

                } else {

                    link.removeAttribute(
                        "aria-current"
                    );

                }

            });

        }


        linksNavegacao.forEach((link) => {

            link.addEventListener(
                "click",
                () => {

                    linksNavegacao.forEach(
                        item => {

                            item.classList.remove(
                                "is-active"
                            );

                            item.removeAttribute(
                                "aria-current"
                            );

                        }
                    );

                    link.classList.add(
                        "is-active"
                    );

                    link.setAttribute(
                        "aria-current",
                        "location"
                    );

                }
            );

        });


        window.addEventListener(
            "hashchange",
            atualizarNavegacao
        );


        /* ==========================================
           19. INICIALIZAÇÃO FINAL
        ========================================== */

        atualizarControles();

        atualizarEstadoAlteracoes();

        atualizarNavegacao();


        /* ==========================================
           20. CONSOLE DE DESENVOLVIMENTO
        ========================================== */

        console.log(
            "Configurações demonstrativas " +
            "inicializadas com sucesso."
        );

        console.log(
            "Nenhuma alteração será enviada " +
            "a servidores ou outros módulos."
        );

    });

})();
