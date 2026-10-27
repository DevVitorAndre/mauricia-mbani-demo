
/* ============================================
   DRA. MAURÍCIA MBANI
   CONFIRMAÇÃO DEMONSTRATIVA

   Lê os dados do pagamento fictício
   e preenche a página de confirmação.

   Nenhuma reserva ou cobrança real.
============================================ */

document.addEventListener("DOMContentLoaded", () => {

    console.log("Confirmação demonstrativa carregada!");

    // ========================================
    // 1. CHAVES DO ARMAZENAMENTO
    // ========================================

    const CHAVE_AGENDAMENTO =
        "mauricia_agendamento_demo";

    const CHAVE_PAGAMENTO =
        "mauricia_pagamento_demo";


    // ========================================
    // 2. ELEMENTOS DA PÁGINA
    // ========================================

    const campos = {

        servico: document.getElementById(
            "confirmacao-servico"
        ),

        modalidade: document.getElementById(
            "confirmacao-modalidade"
        ),

        data: document.getElementById(
            "confirmacao-data"
        ),

        horario: document.getElementById(
            "confirmacao-horario"
        ),

        metodo: document.getElementById(
            "confirmacao-metodo"
        ),

        dataSimulacao: document.getElementById(
            "confirmacao-data-simulacao"
        ),

        valor: document.getElementById(
            "confirmacao-valor"
        )

    };


    // ========================================
    // 3. OUTROS ELEMENTOS VISUAIS
    // ========================================

    const titulo = document.querySelector(
        ".confirmation-header h1"
    );

    const subtitulo = document.querySelector(
        ".confirmation-subtitle"
    );

    const selo = document.querySelector(
        ".confirmation-demo-badge"
    );

    const icone = document.querySelector(
        ".confirmation-success-icon"
    );

    const status = document.querySelector(
        ".confirmation-status"
    );

    const statusPagamento = document.querySelector(
        ".confirmation-payment-status"
    );


    // ========================================
    // 4. FORMATADORES
    // ========================================

    function formatarMoeda(valor) {

        return new Intl.NumberFormat(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        ).format(valor);

    }


    function formatarData(dataISO) {

        if (
            typeof dataISO !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(dataISO)
        ) {
            return "Não informada";
        }

        const data = new Date(
            `${dataISO}T12:00:00`
        );

        if (Number.isNaN(data.getTime())) {
            return "Data inválida";
        }

        return data.toLocaleDateString(
            "pt-BR",
            {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

    }


    function formatarDataHora(dataTexto) {

        if (!dataTexto) {
            return "Não informada";
        }

        const data = new Date(dataTexto);

        if (Number.isNaN(data.getTime())) {
            return "Data inválida";
        }

        return data.toLocaleString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }


    // ========================================
    // 5. LER DADOS DA SESSÃO
    // ========================================

    function lerDados(chave) {

        try {

            const texto = sessionStorage.getItem(
                chave
            );

            if (!texto) {
                return null;
            }

            const dados = JSON.parse(texto);

            if (
                !dados ||
                typeof dados !== "object" ||
                Array.isArray(dados)
            ) {
                return null;
            }

            return dados;

        } catch (erro) {

            console.warn(
                "Não foi possível recuperar:",
                chave,
                erro
            );

            return null;

        }

    }


    // ========================================
    // 6. VERIFICAR A SIMULAÇÃO
    // ========================================

    function verificarSimulacao(
        agendamento,
        pagamento
    ) {

        if (!agendamento || !pagamento) {
            return false;
        }

        // O status deve ser o gerado
        // pelo pagamento-demo.js.

        if (
            pagamento.tipo !== "demonstracao" ||
            pagamento.status !== "simulado"
        ) {
            return false;
        }

        // Todos os campos necessários
        // precisam estar preenchidos.

        const obrigatorios = [
            "servico",
            "modalidade",
            "data",
            "horario"
        ];

        const incompleto = obrigatorios.some(
            (campo) => {

                return (
                    typeof pagamento[campo] !== "string" ||
                    !pagamento[campo].trim()
                );

            }
        );

        if (incompleto) {
            return false;
        }

        // Confere se o pagamento fictício
        // corresponde ao agendamento atual.

        const dadosConferem = obrigatorios.every(
            (campo) => {

                return (
                    pagamento[campo] ===
                    agendamento[campo]
                );

            }
        );

        if (!dadosConferem) {
            return false;
        }

        // Valida informações do pagamento.

        const metodosPermitidos = [
            "Pix",
            "Cartão de crédito",
            "Cartão de débito"
        ];

        if (
            !metodosPermitidos.includes(
                pagamento.metodo
            )
        ) {
            return false;
        }

        if (
            typeof pagamento.valorIlustrativo !==
                "number" ||
            !Number.isFinite(
                pagamento.valorIlustrativo
            ) ||
            pagamento.valorIlustrativo < 0
        ) {
            return false;
        }

        if (
            !pagamento.dataSimulacao ||
            Number.isNaN(
                new Date(
                    pagamento.dataSimulacao
                ).getTime()
            )
        ) {
            return false;
        }

        return true;

    }


    // ========================================
    // 7. ATUALIZAR UM CAMPO COM SEGURANÇA
    // ========================================

    function escrever(campo, valor) {

        if (!campo) {
            return;
        }

        // textContent evita interpretar
        // o conteúdo como código HTML.

        campo.textContent = String(
            valor ?? "Não informado"
        );

    }


    // ========================================
    // 8. PREENCHER OS DADOS DA CONSULTA
    // ========================================

    function preencherConfirmacao(pagamento) {

        escrever(
            campos.servico,
            pagamento.servico
        );

        escrever(
            campos.modalidade,
            pagamento.modalidade
        );

        escrever(
            campos.data,
            formatarData(
                pagamento.data
            )
        );

        escrever(
            campos.horario,
            pagamento.horario
        );

        escrever(
            campos.metodo,
            pagamento.metodo + " (simulado)"
        );

        escrever(
            campos.dataSimulacao,
            formatarDataHora(
                pagamento.dataSimulacao
            )
        );

        escrever(
            campos.valor,
            formatarMoeda(
                pagamento.valorIlustrativo
            )
        );

        console.log(
            "Resumo demonstrativo preenchido!"
        );

    }


    // ========================================
    // 9. QUANDO NÃO HÁ SIMULAÇÃO
    // ========================================

    function exibirSemSimulacao() {

        // Impede mostrar uma conclusão
        // positiva sem dados de pagamento.

        if (titulo) {
            titulo.textContent =
                "Nenhuma simulação encontrada";
        }

        if (subtitulo) {

            subtitulo.textContent =
                "Para visualizar esta página, comece pelo agendamento e conclua o pagamento demonstrativo.";

        }

        if (selo) {

            selo.textContent =
                "Nenhum pagamento demonstrativo registrado";

        }

        if (icone) {

            icone.textContent = "!";

            icone.style.background =
                "var(--color-copper)";

        }

        if (status) {
            status.textContent =
                "Sem registro";
        }

        // Não apresenta a mensagem
        // positiva de pagamento concluído.

        if (statusPagamento) {
            statusPagamento.hidden = true;
        }

        // Limpa todos os campos.

        Object.values(campos).forEach(
            (campo) => {

                escrever(
                    campo,
                    "Não informado"
                );

            }
        );

        console.warn(
            "Confirmação aberta sem simulação válida."
        );

    }


    // ========================================
    // 10. INICIALIZAR CONFIRMAÇÃO
    // ========================================

    function iniciar() {

        const agendamento = lerDados(
            CHAVE_AGENDAMENTO
        );

        const pagamento = lerDados(
            CHAVE_PAGAMENTO
        );

        const simulacaoValida =
            verificarSimulacao(
                agendamento,
                pagamento
            );

        if (!simulacaoValida) {

            exibirSemSimulacao();

            return;
        }

        // Apenas uma simulação visual.
        // Não representa uma confirmação
        // de consulta ou aprovação bancária.

        preencherConfirmacao(
            pagamento
        );

        console.log(
            "Fluxo demonstrativo concluído!"
        );

    }


    iniciar();

});
