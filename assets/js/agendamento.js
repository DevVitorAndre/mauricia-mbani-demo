
/* ============================================
   DRA. MAURÍCIA MBANI
   SISTEMA DE AGENDAMENTO

   PROTÓTIPO DEMONSTRATIVO
   HTML + CSS + JAVASCRIPT

   Sem banco de dados
   Sem reservas reais
   Sem armazenamento de dados pessoais
============================================ */

document.addEventListener("DOMContentLoaded", () => {

    console.log("Sistema de agendamento carregado!");

    // ========================================
    // 1. ELEMENTOS DA PÁGINA
    // ========================================

    const formulario = document.getElementById(
        "booking-form"
    );

    if (!formulario) {
        console.error("Formulário não encontrado!");
        return;
    }

    const servicos = document.querySelectorAll(
        'input[name="servico"]'
    );

    const modalidades = document.querySelectorAll(
        'input[name="modalidade"]'
    );

    const campoData = document.getElementById(
        "data-consulta"
    );

    const botoesHorario = document.querySelectorAll(
        ".time-slot"
    );

    const campoHorario = document.getElementById(
        "horario-selecionado"
    );

    const campoNome = document.getElementById(
        "paciente-nome"
    );

    const campoTelefone = document.getElementById(
        "paciente-telefone"
    );

    const campoEmail = document.getElementById(
        "paciente-email"
    );

    const mensagem = document.getElementById(
        "booking-message"
    );

    const botaoContinuar = document.getElementById(
        "btn-continuar"
    );

    const resumoServico = document.getElementById(
        "resumo-servico"
    );

    const resumoModalidade = document.getElementById(
        "resumo-modalidade"
    );

    const resumoData = document.getElementById(
        "resumo-data"
    );

    const resumoHorario = document.getElementById(
        "resumo-horario"
    );

    const etapas = document.querySelectorAll(
        ".progress-step"
    );


    // ========================================
    // 2. ESTADO DO AGENDAMENTO
    // ========================================

    const agendamento = {

        servico: "",

        modalidade: "",

        data: "",

        horario: ""

    };


    // ========================================
    // 3. DATAS
    // ========================================

    function formatarDataISO(data) {

        const ano = data.getFullYear();

        const mes = String(
            data.getMonth() + 1
        ).padStart(2, "0");

        const dia = String(
            data.getDate()
        ).padStart(2, "0");

        return `${ano}-${mes}-${dia}`;
    }


    function formatarDataBrasileira(dataISO) {

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
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );
    }


    // Permitir datas de hoje até 90 dias.

    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    const dataLimite = new Date(hoje);

    dataLimite.setDate(
        dataLimite.getDate() + 90
    );

    campoData.min = formatarDataISO(hoje);

    campoData.max = formatarDataISO(dataLimite);


    function dataValida() {

        const data = campoData.value;

        if (!data) {
            return false;
        }

        return (
            campoData.validity.valid &&
            data >= campoData.min &&
            data <= campoData.max
        );
    }


    // ========================================
    // 4. MENSAGENS
    // ========================================

    function mostrarMensagem(
        texto,
        tipo = "error"
    ) {

        mensagem.textContent = texto;

        mensagem.className =
            `booking-message ${tipo}`;

    }


    function limparMensagem() {

        mensagem.textContent = "";

        mensagem.className =
            "booking-message";

    }


    // ========================================
    // 5. ATUALIZAR RESUMO
    // ========================================

    function atualizarResumo() {

        resumoServico.textContent =
            agendamento.servico ||
            "Não selecionado";

        resumoModalidade.textContent =
            agendamento.modalidade ||
            "Não selecionada";

        resumoData.textContent =
            formatarDataBrasileira(
                agendamento.data
            );

        resumoHorario.textContent =
            agendamento.horario ||
            "Não selecionado";

        atualizarProgresso();

    }


    // ========================================
    // 6. SELEÇÃO DO SERVIÇO
    // ========================================

    servicos.forEach((radio) => {

        radio.addEventListener(
            "change",
            () => {

                if (!radio.checked) {
                    return;
                }

                agendamento.servico = radio.value;

                atualizarResumo();

                limparMensagem();

                console.log(
                    "Serviço:",
                    agendamento.servico
                );

            }
        );

    });


    // ========================================
    // 7. SELEÇÃO DA MODALIDADE
    // ========================================

    modalidades.forEach((radio) => {

        radio.addEventListener(
            "change",
            () => {

                if (!radio.checked) {
                    return;
                }

                agendamento.modalidade =
                    radio.value;

                atualizarResumo();

                limparMensagem();

                console.log(
                    "Modalidade:",
                    agendamento.modalidade
                );

            }
        );

    });


    // ========================================
    // 8. SELEÇÃO DA DATA
    // ========================================

    campoData.addEventListener(
        "change",
        () => {

            agendamento.data = campoData.value;

            // A seleção do horário permanece.
            // Os horários são fictícios e iguais
            // para todas as datas nesta demo.

            if (!dataValida()) {

                agendamento.data = "";

                campoData.value = "";

                mostrarMensagem(
                    "Selecione uma data válida dentro dos próximos 90 dias."
                );

            } else {

                limparMensagem();

            }

            atualizarResumo();

            console.log(
                "Data:",
                agendamento.data
            );

        }
    );


    // ========================================
    // 9. SELEÇÃO DE HORÁRIOS
    // ========================================

    botoesHorario.forEach((botao) => {

        botao.setAttribute(
            "aria-pressed",
            "false"
        );

        botao.addEventListener(
            "click",
            (evento) => {

                evento.preventDefault();

                if (botao.disabled) {
                    return;
                }

                // Desmarca os demais horários.

                botoesHorario.forEach((item) => {

                    item.classList.remove(
                        "selected",
                        "is-selected"
                    );

                    item.setAttribute(
                        "aria-pressed",
                        "false"
                    );

                });

                // Marca o horário escolhido.

                botao.classList.add("selected");

                botao.setAttribute(
                    "aria-pressed",
                    "true"
                );

                agendamento.horario =
                    botao.dataset.time ||
                    botao.textContent.trim();

                campoHorario.value =
                    agendamento.horario;

                atualizarResumo();

                limparMensagem();

                console.log(
                    "Horário:",
                    agendamento.horario
                );

            }
        );

    });


    // ========================================
    // 10. MÁSCARA DE TELEFONE
    // ========================================

    /*
       Exemplos:

       51           -> (51
       519          -> (51) 9
       51999999999  -> (51) 99999-9999

       Aceita no máximo 11 números.
    */

    campoTelefone.maxLength = 15;

    campoTelefone.inputMode = "numeric";


    function formatarTelefone(valor) {

        const numeros = valor
            .replace(/\D/g, "")
            .slice(0, 11);

        if (numeros.length === 0) {
            return "";
        }

        if (numeros.length <= 2) {
            return `(${numeros}`;
        }

        if (numeros.length <= 6) {

            return (
                `(${numeros.slice(0, 2)}) ` +
                numeros.slice(2)
            );

        }

        if (numeros.length <= 10) {

            return (
                `(${numeros.slice(0, 2)}) ` +
                numeros.slice(2, 6) +
                "-" +
                numeros.slice(6)
            );

        }

        return (
            `(${numeros.slice(0, 2)}) ` +
            numeros.slice(2, 7) +
            "-" +
            numeros.slice(7)
        );

    }


    campoTelefone.addEventListener(
        "input",
        () => {

            const valorAnterior =
                campoTelefone.value;

            const posicaoAnterior =
                campoTelefone.selectionStart ??
                valorAnterior.length;

            // Quantos números estão antes
            // da posição atual do cursor?

            const numerosAntes =
                valorAnterior
                    .slice(0, posicaoAnterior)
                    .replace(/\D/g, "")
                    .length;

            // Aplica a máscara.

            const valorFormatado =
                formatarTelefone(valorAnterior);

            campoTelefone.value =
                valorFormatado;

            // Procura a nova posição do cursor.

            let novaPosicao = 0;

            let encontrados = 0;

            if (
                posicaoAnterior >=
                valorAnterior.length
            ) {

                novaPosicao =
                    valorFormatado.length;

            } else {

                while (
                    novaPosicao <
                        valorFormatado.length &&
                    encontrados < numerosAntes
                ) {

                    if (
                        /\d/.test(
                            valorFormatado[novaPosicao]
                        )
                    ) {

                        encontrados++;

                    }

                    novaPosicao++;

                }

            }

            campoTelefone.setSelectionRange(
                novaPosicao,
                novaPosicao
            );

            limparMensagem();

            atualizarProgresso();

        }
    );


    // ========================================
    // 11. INDICADOR DE PROGRESSO
    // ========================================

    function atualizarProgresso() {

        const nomePreenchido =
            campoNome.value.trim().length >= 3;

        const telefonePreenchido =
            [10, 11].includes(
                campoTelefone.value
                    .replace(/\D/g, "")
                    .length
            );

        const emailPreenchido =
            campoEmail.value.trim().length > 0;

        let etapaAtual = 0;

        if (agendamento.servico) {
            etapaAtual = 1;
        }

        if (
            agendamento.servico &&
            agendamento.modalidade
        ) {
            etapaAtual = 2;
        }

        if (
            dataValida() &&
            agendamento.horario
        ) {
            etapaAtual = 3;
        }

        if (
            dataValida() &&
            agendamento.horario &&
            nomePreenchido &&
            telefonePreenchido &&
            emailPreenchido
        ) {
            etapaAtual = 4;
        }

        etapas.forEach((etapa, indice) => {

            etapa.classList.remove(
                "active",
                "completed"
            );

            if (indice < etapaAtual) {

                etapa.classList.add(
                    "completed"
                );

            } else if (indice === etapaAtual) {

                etapa.classList.add(
                    "active"
                );

            }

        });

    }


    [campoNome, campoEmail].forEach(
        (campo) => {

            campo.addEventListener(
                "input",
                atualizarProgresso
            );

        }
    );


    // ========================================
    // 12. VALIDAÇÃO
    // ========================================

    function mostrarErro(texto, campo = null) {

        mostrarMensagem(texto, "error");

        if (campo) {

            campo.classList.add(
                "is-invalid"
            );

            campo.setAttribute(
                "aria-invalid",
                "true"
            );

            campo.focus();

        }

        return false;

    }


    function limparErros() {

        [
            campoData,
            campoNome,
            campoTelefone,
            campoEmail
        ].forEach((campo) => {

            campo.classList.remove(
                "is-invalid"
            );

            campo.removeAttribute(
                "aria-invalid"
            );

        });

    }


    function validarFormulario() {

        limparErros();

        // Serviço

        if (!agendamento.servico) {

            return mostrarErro(
                "Selecione o tipo de atendimento."
            );

        }

        // Modalidade

        if (!agendamento.modalidade) {

            return mostrarErro(
                "Selecione a modalidade da consulta."
            );

        }

        // Data

        if (!dataValida()) {

            return mostrarErro(
                "Selecione uma data válida para a consulta.",
                campoData
            );

        }

        agendamento.data = campoData.value;

        // Horário

        if (!agendamento.horario) {

            mostrarErro(
                "Escolha um horário para a consulta."
            );

            const primeiroHorario =
                botoesHorario[0];

            if (primeiroHorario) {
                primeiroHorario.focus();
            }

            return false;

        }

        // Nome fictício

        if (
            campoNome.value.trim().length < 3
        ) {

            return mostrarErro(
                "Informe um nome fictício com pelo menos 3 caracteres.",
                campoNome
            );

        }

        // Telefone fictício

        const numerosTelefone =
            campoTelefone.value.replace(
                /\D/g,
                ""
            );

        if (
            numerosTelefone.length !== 10 &&
            numerosTelefone.length !== 11
        ) {

            return mostrarErro(
                "Informe um telefone fictício com DDD.",
                campoTelefone
            );

        }

        // E-mail fictício

        const email = campoEmail.value.trim();

        const formatoEmail =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formatoEmail.test(email)) {

            return mostrarErro(
                "Informe um e-mail fictício válido.",
                campoEmail
            );

        }

        return true;

    }


    // ========================================
    // 13. CONTINUAR PARA PAGAMENTO
    // ========================================

    formulario.addEventListener(
        "submit",
        (evento) => {

            evento.preventDefault();

            limparMensagem();

            // Impede avançar com campos inválidos.

            if (!validarFormulario()) {
                return;
            }

            // Informações necessárias para
            // preencher a tela de pagamento.
            //
            // Não guardamos nome, telefone
            // ou e-mail do paciente.

            const dadosDemonstrativos = {

                servico: agendamento.servico,

                modalidade: agendamento.modalidade,

                data: agendamento.data,

                horario: agendamento.horario

            };

            // =================================
            // SALVAR DADOS TEMPORÁRIOS
            // =================================

            try {

                sessionStorage.setItem(
                    "mauricia_agendamento_demo",
                    JSON.stringify(
                        dadosDemonstrativos
                    )
                );

            } catch (erro) {

                console.error(
                    "Erro ao salvar agendamento:",
                    erro
                );

                mostrarMensagem(
                    "Não foi possível preparar o pagamento neste navegador. Verifique se o armazenamento de sessão está permitido.",
                    "error"
                );

                return;

            }

            // =================================
            // REDIRECIONAR
            // =================================

            console.log(
                "Agendamento validado:",
                dadosDemonstrativos
            );

            console.log(
                "Abrindo pagamento demonstrativo..."
            );

            // Mostra um pequeno feedback
            // enquanto o navegador redireciona.

            botaoContinuar.disabled = true;

            botaoContinuar.textContent =
                "Abrindo pagamento...";

            // O pagamento.html está na mesma
            // pasta pages/ do agendamento.html.

            window.location.assign(
                "pagamento.html"
            );

        }
    );


    // ========================================
    // 14. INICIALIZAÇÃO
    // ========================================

    const servicoInicial =
        document.querySelector(
            'input[name="servico"]:checked'
        );

    const modalidadeInicial =
        document.querySelector(
            'input[name="modalidade"]:checked'
        );

    if (servicoInicial) {

        agendamento.servico =
            servicoInicial.value;

    }

    if (modalidadeInicial) {

        agendamento.modalidade =
            modalidadeInicial.value;

    }

    // Caso o navegador tenha restaurado
    // valores anteriores do formulário.

    agendamento.data = campoData.value;

    const horarioInicial =
        document.querySelector(
            ".time-slot.selected"
        );

    if (horarioInicial) {

        agendamento.horario =
            horarioInicial.dataset.time ||
            horarioInicial.textContent.trim();

        campoHorario.value =
            agendamento.horario;

        horarioInicial.setAttribute(
            "aria-pressed",
            "true"
        );

    }

    // Aplica a máscara se o navegador
    // preencher automaticamente o telefone.

    campoTelefone.value =
        formatarTelefone(
            campoTelefone.value
        );

    atualizarResumo();

    console.log(
        "Agendamento pronto para testes!"
    );

});
