
/* ============================================
   DRA. MAURÍCIA MBANI
   SISTEMA DE PAGAMENTO DEMONSTRATIVO

   HTML + CSS + JAVASCRIPT

   - Sem integração bancária
   - Sem pagamento real
   - Sem captura de dados de cartão
   - Sem armazenamento de dados pessoais
============================================ */

document.addEventListener("DOMContentLoaded", () => {

    console.log("Pagamento demonstrativo carregado!");

    // ========================================
    // 1. CONFIGURAÇÕES
    // ========================================

    const CHAVE_AGENDAMENTO =
        "mauricia_agendamento_demo";

    const CHAVE_PAGAMENTO =
        "mauricia_pagamento_demo";

    // Valor inteiramente fictício.
    // Não representa o preço real da médica.

    const VALOR_DEMONSTRATIVO = 250.00;

    // Métodos disponíveis nesta demonstração.

    const metodos = {

        "Pix": {
            titulo: "Pagamento via Pix",
            icone: "◈",
            descricao:
                "Na versão definitiva, o sistema poderá gerar uma cobrança Pix por meio de um provedor de pagamentos.",
            aviso:
                "Esta demonstração não gera QR Code, chave Pix ou cobrança real."
        },

        "Cartão de crédito": {
            titulo: "Pagamento com cartão de crédito",
            icone: "▣",
            descricao:
                "Na versão definitiva, o pagamento por cartão poderá ser realizado em um ambiente seguro de um provedor especializado.",
            aviso:
                "Esta demonstração não solicita número de cartão, validade ou código de segurança."
        },

        "Cartão de débito": {
            titulo: "Pagamento com cartão de débito",
            icone: "▤",
            descricao:
                "Na versão definitiva, a disponibilidade do débito dependerá do provedor de pagamentos contratado.",
            aviso:
                "Nenhum valor será debitado nesta demonstração."
        }

    };


    // ========================================
    // 2. ELEMENTOS DA PÁGINA
    // ========================================

    const elementos = {

        // Detalhes da consulta

        servico: document.getElementById(
            "pagamento-servico"
        ),

        modalidade: document.getElementById(
            "pagamento-modalidade"
        ),

        data: document.getElementById(
            "pagamento-data"
        ),

        horario: document.getElementById(
            "pagamento-horario"
        ),

        // Resumo lateral

        resumoServico: document.getElementById(
            "resumo-pagamento-servico"
        ),

        resumoModalidade: document.getElementById(
            "resumo-pagamento-modalidade"
        ),

        resumoData: document.getElementById(
            "resumo-pagamento-data"
        ),

        resumoHorario: document.getElementById(
            "resumo-pagamento-horario"
        ),

        // Valor

        valor: document.getElementById(
            "payment-total"
        ),

        // Área informativa

        informacoes: document.getElementById(
            "payment-method-info"
        ),

        // Botão

        botao: document.getElementById(
            "btn-simular-pagamento"
        ),

        // Mensagem

        mensagem: document.getElementById(
            "payment-message"
        )

    };

    const radiosPagamento = document.querySelectorAll(
        'input[name="metodo-pagamento"]'
    );


    // ========================================
    // 3. ESTADO DA PÁGINA
    // ========================================

    let agendamento = null;

    let metodoSelecionado = "Pix";

    let simulacaoConcluida = false;


    // ========================================
    // 4. FUNÇÕES DE FORMATAÇÃO
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

        if (!dataISO) {
            return "Não selecionada";
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


    // ========================================
    // 5. MENSAGENS
    // ========================================

    function mostrarMensagem(
        texto,
        tipo = "success"
    ) {

        if (!elementos.mensagem) {
            return;
        }

        elementos.mensagem.textContent = texto;

        elementos.mensagem.className =
            `payment-message ${tipo}`;

    }


    function limparMensagem() {

        if (!elementos.mensagem) {
            return;
        }

        elementos.mensagem.textContent = "";

        elementos.mensagem.className =
            "payment-message";

    }


    // ========================================
    // 6. RECUPERAR O AGENDAMENTO
    // ========================================

    function recuperarAgendamento() {

        try {

            const dadosSalvos =
                sessionStorage.getItem(
                    CHAVE_AGENDAMENTO
                );

            if (!dadosSalvos) {
                return null;
            }

            const dados = JSON.parse(
                dadosSalvos
            );

            // Verificamos se a estrutura
            // contém os campos necessários.

            if (
                !dados ||
                typeof dados !== "object" ||
                !dados.servico ||
                !dados.modalidade ||
                !dados.data ||
                !dados.horario
            ) {

                return null;

            }

            return {

                servico: String(
                    dados.servico
                ),

                modalidade: String(
                    dados.modalidade
                ),

                data: String(
                    dados.data
                ),

                horario: String(
                    dados.horario
                )

            };

        } catch (erro) {

            console.warn(
                "Falha ao recuperar agendamento:",
                erro
            );

            return null;

        }

    }


    // ========================================
    // 7. PREENCHER O RESUMO
    // ========================================

    function preencherResumo() {

        if (!agendamento) {
            return;
        }

        const dataFormatada = formatarData(
            agendamento.data
        );

        // Informações principais

        elementos.servico.textContent =
            agendamento.servico;

        elementos.modalidade.textContent =
            agendamento.modalidade;

        elementos.data.textContent =
            dataFormatada;

        elementos.horario.textContent =
            agendamento.horario;

        // Resumo lateral

        elementos.resumoServico.textContent =
            agendamento.servico;

        elementos.resumoModalidade.textContent =
            agendamento.modalidade;

        elementos.resumoData.textContent =
            dataFormatada;

        elementos.resumoHorario.textContent =
            agendamento.horario;

        // Valor fictício

        elementos.valor.textContent =
            formatarMoeda(
                VALOR_DEMONSTRATIVO
            );

        console.log(
            "Resumo da consulta preenchido."
        );

    }


    // ========================================
    // 8. INFORMAÇÕES DO MÉTODO ESCOLHIDO
    // ========================================

    function atualizarMetodoPagamento() {

        const metodo =
            metodos[metodoSelecionado];

        if (!metodo || !elementos.informacoes) {
            return;
        }

        // Localiza os elementos existentes.

        const icone =
            elementos.informacoes.querySelector(
                ".method-info-icon"
            );

        const conteudo =
            elementos.informacoes.querySelector(
                "div:last-child"
            );

        if (!icone || !conteudo) {
            return;
        }

        // Atualiza o ícone.

        icone.textContent = metodo.icone;

        // Cria os textos de forma segura.

        const titulo =
            document.createElement("h3");

        titulo.textContent = metodo.titulo;

        const descricao =
            document.createElement("p");

        descricao.textContent =
            metodo.descricao;

        const aviso =
            document.createElement("p");

        aviso.textContent =
            metodo.aviso;

        // Substitui os textos anteriores.

        conteudo.replaceChildren(
            titulo,
            descricao,
            aviso
        );

        console.log(
            "Método selecionado:",
            metodoSelecionado
        );

    }


    // ========================================
    // 9. SELEÇÃO PIX / CRÉDITO / DÉBITO
    // ========================================

    radiosPagamento.forEach((radio) => {

        radio.addEventListener(
            "change",
            () => {

                if (!radio.checked) {
                    return;
                }

                if (!metodos[radio.value]) {
                    return;
                }

                metodoSelecionado =
                    radio.value;

                // Se a pessoa alterar o método
                // após uma simulação, reiniciamos
                // somente o estado do pagamento.

                if (simulacaoConcluida) {

                    simulacaoConcluida = false;

                    elementos.botao.disabled = false;

                    elementos.botao.textContent =
                        "Simular pagamento →";

                    try {

                        sessionStorage.removeItem(
                            CHAVE_PAGAMENTO
                        );

                    } catch (erro) {

                        console.warn(
                            "Não foi possível limpar a simulação.",
                            erro
                        );

                    }

                }

                atualizarMetodoPagamento();

                limparMensagem();

            }
        );

    });


    // ========================================
    // 10. BLOQUEAR PAGAMENTO SEM CONSULTA
    // ========================================

    function bloquearSemAgendamento() {

        elementos.botao.disabled = true;

        elementos.botao.textContent =
            "Agendamento necessário";

        mostrarMensagem(
            "Nenhum agendamento demonstrativo foi encontrado. Volte à página de agendamento e selecione uma consulta antes de continuar.",
            "error"
        );

        // Remover os valores padrão do HTML
        // para não apresentar uma consulta
        // que o visitante não selecionou.

        const campos = [

            elementos.servico,
            elementos.modalidade,
            elementos.data,
            elementos.horario,
            elementos.resumoServico,
            elementos.resumoModalidade,
            elementos.resumoData,
            elementos.resumoHorario

        ];

        campos.forEach((campo) => {

            if (campo) {
                campo.textContent =
                    "Não selecionado";
            }

        });

        console.warn(
            "Pagamento aberto sem agendamento."
        );

    }


    // ========================================
    // 11. SIMULAR PAGAMENTO
    // ========================================

    function simularPagamento() {

        limparMensagem();

        // Não prossegue sem agendamento.

        if (!agendamento) {

            bloquearSemAgendamento();

            return;

        }

        // Evita repetir a mesma simulação.

        if (simulacaoConcluida) {
            return;
        }

        if (!metodos[metodoSelecionado]) {

            mostrarMensagem(
                "Selecione uma forma de pagamento válida.",
                "error"
            );

            return;

        }

        // ====================================
        // RESULTADO DEMONSTRATIVO
        // ====================================

        /*
           Isto NÃO é uma aprovação bancária.

           Estamos apenas mostrando como
           seria a experiência do paciente
           em um sistema completo.
        */

        const resultado = {

            tipo: "demonstracao",

            status: "simulado",

            servico: agendamento.servico,

            modalidade: agendamento.modalidade,

            data: agendamento.data,

            horario: agendamento.horario,

            metodo: metodoSelecionado,

            valorIlustrativo:
                VALOR_DEMONSTRATIVO,

            dataSimulacao:
                new Date().toISOString()

        };


        // ====================================
        // SALVAR RESULTADO TEMPORÁRIO
        // ====================================

        try {

            sessionStorage.setItem(
                CHAVE_PAGAMENTO,
                JSON.stringify(resultado)
            );

        } catch (erro) {

            console.warn(
                "Não foi possível salvar o resultado demonstrativo.",
                erro
            );

            mostrarMensagem(
                "Não foi possível registrar a simulação neste navegador.",
                "error"
            );

            return;

        }


        // ====================================
        // ATUALIZAR A INTERFACE
        // ====================================

        simulacaoConcluida = true;

        elementos.botao.disabled = true;

        elementos.botao.textContent =
            "Simulação concluída ✓";

        mostrarMensagem(
            `Simulação concluída com sucesso! Forma selecionada: ${metodoSelecionado}. Nenhuma cobrança foi realizada. A próxima etapa será a tela de confirmação demonstrativa.`,
            "success"
        );

        console.log(
            "Pagamento fictício concluído:",
            resultado
        );
        
        // Abre a confirmação após salvar
        // o resultado da simulação.

        window.location.assign(
            "confirmacao.html"
        );



        // ====================================
        // FUTURO REDIRECIONAMENTO
        // ====================================

        /*
           Quando desenvolvermos e testarmos
           a página confirmacao.html,
           ativaremos a navegação:

           window.location.assign(
               "confirmacao.html"
           );

           Por enquanto, mostramos a mensagem
           para não abrir uma página incompleta.
        */

    }


    // ========================================
    // 12. EVENTO DO BOTÃO
    // ========================================

    if (elementos.botao) {

        elementos.botao.addEventListener(
            "click",
            simularPagamento
        );

    }


    // ========================================
    // 13. INICIALIZAR A PÁGINA
    // ========================================

    const radioInicial =
        document.querySelector(
            'input[name="metodo-pagamento"]:checked'
        );

    if (
        radioInicial &&
        metodos[radioInicial.value]
    ) {

        metodoSelecionado =
            radioInicial.value;

    }

    atualizarMetodoPagamento();

    // Atualiza valor fictício, mesmo
    // antes de recuperar o agendamento.

    if (elementos.valor) {

        elementos.valor.textContent =
            formatarMoeda(
                VALOR_DEMONSTRATIVO
            );

    }

    agendamento = recuperarAgendamento();

    if (agendamento) {

        preencherResumo();

        console.log(
            "Agendamento recuperado:",
            agendamento
        );

    } else {

        bloquearSemAgendamento();

    }

    console.log(
        "Sistema de pagamento pronto!"
    );

});
