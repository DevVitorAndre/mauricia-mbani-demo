
/* =====================================================
   DRA. MAURÍCIA MBANI
   AGENDA ADMINISTRATIVA DEMONSTRATIVA

   ARQUIVO: assets/js/agenda.js

   - Calendário semanal
   - Navegação de datas
   - Filtros
   - Agendamento fictício
   - Detalhes da consulta
   - Confirmação de consulta
   - Indicadores dinâmicos
   - Sem banco de dados
   - Sem armazenamento persistente
===================================================== */

(() => {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {

        /* ==========================================
           1. ELEMENTOS DA PÁGINA
        ========================================== */

        const elementos = {

            semana: document.getElementById(
                "agenda-week-grid"
            ),

            semanaLabel: document.getElementById(
                "agenda-week-label"
            ),

            anterior: document.getElementById(
                "agenda-prev-week"
            ),

            proxima: document.getElementById(
                "agenda-next-week"
            ),

            hoje: document.getElementById(
                "agenda-today-button"
            ),

            filtroServico: document.getElementById(
                "agenda-filter-service"
            ),

            filtroModalidade: document.getElementById(
                "agenda-filter-modality"
            ),

            filtroStatus: document.getElementById(
                "agenda-filter-status"
            ),

            limparFiltros: document.getElementById(
                "agenda-clear-filters"
            ),

            tabela: document.getElementById(
                "agenda-table-body"
            ),

            contador: document.getElementById(
                "agenda-results-count"
            ),

            vazio: document.getElementById(
                "agenda-empty-state"
            ),

            total: document.getElementById(
                "agenda-total"
            ),

            confirmadas: document.getElementById(
                "agenda-confirmed"
            ),

            pendentes: document.getElementById(
                "agenda-pending"
            ),

            online: document.getElementById(
                "agenda-online"
            ),

            novo: document.getElementById(
                "agenda-new-button"
            ),

            modal: document.getElementById(
                "agenda-modal"
            ),

            fecharModal: document.getElementById(
                "agenda-modal-close"
            ),

            cancelar: document.getElementById(
                "agenda-cancel-button"
            ),

            formulario: document.getElementById(
                "agenda-form"
            ),

            paciente: document.getElementById(
                "agenda-patient"
            ),

            servico: document.getElementById(
                "agenda-service"
            ),

            data: document.getElementById(
                "agenda-date"
            ),

            horario: document.getElementById(
                "agenda-time"
            ),

            modalidade: document.getElementById(
                "agenda-modality"
            ),

            situacao: document.getElementById(
                "agenda-status"
            ),

            mensagem: document.getElementById(
                "agenda-form-message"
            ),

            detalhesModal: document.getElementById(
                "agenda-details-modal"
            ),

            detalhesConteudo: document.getElementById(
                "agenda-details-content"
            ),

            detalhesFechar: document.getElementById(
                "agenda-details-close"
            ),

            detalhesDispensar: document.getElementById(
                "agenda-details-dismiss"
            ),

            detalhesConfirmar: document.getElementById(
                "agenda-details-confirm"
            )

        };


        /* ==========================================
           2. VERIFICAR ELEMENTOS
        ========================================== */

        const faltando = Object.entries(elementos)
            .filter(([, elemento]) => !elemento)
            .map(([nome]) => nome);

        if (faltando.length > 0) {

            console.warn(
                "Agenda: elementos não encontrados:",
                faltando.join(", ")
            );

            return;
        }


        /* ==========================================
           3. FUNÇÕES DE DATA

           Utilizamos datas locais para evitar
           deslocamento de dia por fuso horário.
        ========================================== */

        function criarData(
            ano,
            mes,
            dia
        ) {

            return new Date(
                ano,
                mes,
                dia,
                12,
                0,
                0
            );
        }


        function dataAtual() {

            const agora = new Date();

            return criarData(
                agora.getFullYear(),
                agora.getMonth(),
                agora.getDate()
            );
        }


        function adicionarDias(data, quantidade) {

            const resultado = new Date(data);

            resultado.setDate(
                resultado.getDate() + quantidade
            );

            return resultado;
        }


        function inicioDaSemana(data) {

            const resultado = new Date(data);

            const dia = resultado.getDay();

            // Segunda-feira = início da semana.

            const deslocamento =
                dia === 0 ? -6 : 1 - dia;

            return adicionarDias(
                resultado,
                deslocamento
            );
        }


        function formatarISO(data) {

            const ano = data.getFullYear();

            const mes = String(
                data.getMonth() + 1
            ).padStart(2, "0");

            const dia = String(
                data.getDate()
            ).padStart(2, "0");

            return `${ano}-${mes}-${dia}`;
        }


        function lerDataISO(texto) {

            if (
                !/^\d{4}-\d{2}-\d{2}$/.test(texto)
            ) {
                return null;
            }

            const [
                ano,
                mes,
                dia
            ] = texto.split("-").map(Number);

            const resultado = criarData(
                ano,
                mes - 1,
                dia
            );

            // Impede aceitar datas inválidas
            // como 31 de fevereiro.

            if (
                resultado.getFullYear() !== ano ||
                resultado.getMonth() !== mes - 1 ||
                resultado.getDate() !== dia
            ) {
                return null;
            }

            return resultado;
        }


        function formatarDataCurta(dataISO) {

            const data = lerDataISO(dataISO);

            if (!data) {
                return "Data inválida";
            }

            return new Intl.DateTimeFormat(
                "pt-BR",
                {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                }
            ).format(data);
        }


        function formatarSemana(inicio) {

            const fim = adicionarDias(
                inicio,
                6
            );

            const inicioTexto =
                new Intl.DateTimeFormat(
                    "pt-BR",
                    {
                        day: "2-digit",
                        month: "short"
                    }
                ).format(inicio);

            const fimTexto =
                new Intl.DateTimeFormat(
                    "pt-BR",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                ).format(fim);

            return `${inicioTexto} a ${fimTexto}`;
        }


        /* ==========================================
           4. ESTADO DA DEMONSTRAÇÃO
        ========================================== */

        let semanaAtual = inicioDaSemana(
            dataAtual()
        );

        let proximoId = 5;

        let consultaSelecionadaId = null;

        const nomesDias = [
            "SEG",
            "TER",
            "QUA",
            "QUI",
            "SEX",
            "SÁB",
            "DOM"
        ];


        /* ==========================================
           5. CONSULTAS FICTÍCIAS INICIAIS

           Os exemplos sempre aparecem
           na semana atual do visitante.
        ========================================== */

        const consultas = [

            {
                id: 1,
                data: formatarISO(
                    adicionarDias(semanaAtual, 0)
                ),
                horario: "09:00",
                paciente: "Paciente Exemplo 01",
                servico: "Saúde Capilar",
                modalidade: "Presencial",
                situacao: "Confirmada"
            },

            {
                id: 2,
                data: formatarISO(
                    adicionarDias(semanaAtual, 1)
                ),
                horario: "10:30",
                paciente: "Paciente Exemplo 02",
                servico: "Clínica Geral",
                modalidade: "Presencial",
                situacao: "Pendente"
            },

            {
                id: 3,
                data: formatarISO(
                    adicionarDias(semanaAtual, 2)
                ),
                horario: "14:00",
                paciente: "Paciente Exemplo 03",
                servico: "Consulta Online",
                modalidade: "Online",
                situacao: "Confirmada"
            },

            {
                id: 4,
                data: formatarISO(
                    adicionarDias(semanaAtual, 3)
                ),
                horario: "15:30",
                paciente: "Paciente Exemplo 04",
                servico: "Saúde Capilar",
                modalidade: "Presencial",
                situacao: "Pendente"
            }

        ];


        /* ==========================================
           6. FILTRAR CONSULTAS DA SEMANA
        ========================================== */

        function consultasDaSemana() {

            const inicioISO = formatarISO(
                semanaAtual
            );

            const fimISO = formatarISO(
                adicionarDias(semanaAtual, 6)
            );

            return consultas.filter((consulta) => {

                return (
                    consulta.data >= inicioISO &&
                    consulta.data <= fimISO
                );

            });

        }


        function consultasFiltradas() {

            const servico =
                elementos.filtroServico.value;

            const modalidade =
                elementos.filtroModalidade.value;

            const situacao =
                elementos.filtroStatus.value;

            return consultasDaSemana()
                .filter((consulta) => {

                    if (
                        servico !== "todos" &&
                        consulta.servico !== servico
                    ) {
                        return false;
                    }

                    if (
                        modalidade !== "todas" &&
                        consulta.modalidade !== modalidade
                    ) {
                        return false;
                    }

                    if (
                        situacao !== "todas" &&
                        consulta.situacao !== situacao
                    ) {
                        return false;
                    }

                    return true;

                })
                .sort((a, b) => {

                    return (
                        a.data.localeCompare(b.data) ||
                        a.horario.localeCompare(b.horario)
                    );

                });

        }


        /* ==========================================
           7. ATUALIZAR INDICADORES

           Resumo da semana completa,
           independentemente dos filtros.
        ========================================== */

        function atualizarIndicadores() {

            const registros =
                consultasDaSemana();

            const contar = (condicao) => {

                return registros.filter(
                    condicao
                ).length;

            };

            elementos.total.textContent =
                String(registros.length).padStart(2, "0");

            elementos.confirmadas.textContent =
                String(
                    contar(
                        c => c.situacao === "Confirmada"
                    )
                ).padStart(2, "0");

            elementos.pendentes.textContent =
                String(
                    contar(
                        c => c.situacao === "Pendente"
                    )
                ).padStart(2, "0");

            elementos.online.textContent =
                String(
                    contar(
                        c => c.modalidade === "Online"
                    )
                ).padStart(2, "0");

        }


        /* ==========================================
           8. CRIAR ELEMENTOS DE TEXTO
        ========================================== */

        function criarElemento(
            tag,
            classe,
            texto
        ) {

            const elemento = document.createElement(
                tag
            );

            if (classe) {
                elemento.className = classe;
            }

            if (texto !== undefined) {

                // Dados apresentados como texto,
                // nunca interpretados como HTML.

                elemento.textContent = texto;
            }

            return elemento;
        }


        function classeSituacao(situacao) {

            if (situacao === "Confirmada") {
                return "confirmed";
            }

            if (situacao === "Cancelada") {
                return "cancelled";
            }

            return "pending";
        }


        /* ==========================================
           9. CRIAR EVENTO NO CALENDÁRIO
        ========================================== */

        function criarEvento(consulta) {

            const evento = criarElemento(
                "button",
                "agenda-event " +
                classeSituacao(consulta.situacao)
            );

            evento.type = "button";

            evento.dataset.agendaId =
                String(consulta.id);

            evento.setAttribute(
                "aria-label",
                `${consulta.horario}, ` +
                `${consulta.paciente}, ` +
                `${consulta.servico}, ` +
                `${consulta.situacao}`
            );

            evento.appendChild(
                criarElemento(
                    "span",
                    "agenda-event-time",
                    consulta.horario
                )
            );

            evento.appendChild(
                criarElemento(
                    "strong",
                    "",
                    consulta.paciente.replace(
                        "Paciente ",
                        ""
                    )
                )
            );

            evento.appendChild(
                criarElemento(
                    "small",
                    "",
                    consulta.servico
                )
            );

            return evento;
        }


        /* ==========================================
           10. RENDERIZAR CALENDÁRIO
        ========================================== */

        function renderizarCalendario() {

            const filtradas =
                consultasFiltradas();

            elementos.semana.replaceChildren();

            elementos.semanaLabel.textContent =
                formatarSemana(semanaAtual);

            const hojeISO = formatarISO(
                dataAtual()
            );

            for (let indice = 0; indice < 7; indice++) {

                const data = adicionarDias(
                    semanaAtual,
                    indice
                );

                const dataISO = formatarISO(
                    data
                );

                const dia = criarElemento(
                    "div",
                    "agenda-day"
                );

                if (dataISO === hojeISO) {
                    dia.classList.add("is-today");
                }

                const cabecalho = criarElemento(
                    "div",
                    "agenda-day-header"
                );

                cabecalho.appendChild(
                    criarElemento(
                        "span",
                        "",
                        nomesDias[indice]
                    )
                );

                cabecalho.appendChild(
                    criarElemento(
                        "strong",
                        "",
                        String(
                            data.getDate()
                        ).padStart(2, "0")
                    )
                );

                const eventos = criarElemento(
                    "div",
                    "agenda-day-events"
                );

                const consultasDoDia =
                    filtradas.filter(
                        c => c.data === dataISO
                    );

                if (consultasDoDia.length === 0) {

                    eventos.appendChild(
                        criarElemento(
                            "p",
                            "agenda-empty-day",
                            "Sem consultas"
                        )
                    );

                } else {

                    consultasDoDia.forEach((consulta) => {

                        eventos.appendChild(
                            criarEvento(consulta)
                        );

                    });
                }

                dia.appendChild(cabecalho);
                dia.appendChild(eventos);

                elementos.semana.appendChild(dia);
            }

        }


        /* ==========================================
           11. CRIAR CÉLULA DE TABELA
        ========================================== */

        function criarCelula(
            texto,
            negrito = false
        ) {

            const celula = document.createElement(
                "td"
            );

            if (negrito) {

                celula.appendChild(
                    criarElemento(
                        "strong",
                        "",
                        texto
                    )
                );

            } else {

                celula.textContent = texto;
            }

            return celula;
        }


        /* ==========================================
           12. RENDERIZAR TABELA
        ========================================== */

        function renderizarTabela() {

            const registros =
                consultasFiltradas();

            elementos.tabela.replaceChildren();

            elementos.contador.textContent =
                `${registros.length} ` +
                (
                    registros.length === 1
                        ? "registro fictício"
                        : "registros fictícios"
                );

            elementos.vazio.hidden =
                registros.length !== 0;

            registros.forEach((consulta) => {

                const linha =
                    document.createElement("tr");

                linha.appendChild(
                    criarCelula(
                        formatarDataCurta(
                            consulta.data
                        )
                    )
                );

                linha.appendChild(
                    criarCelula(
                        consulta.horario,
                        true
                    )
                );

                linha.appendChild(
                    criarCelula(
                        consulta.paciente
                    )
                );

                linha.appendChild(
                    criarCelula(
                        consulta.servico
                    )
                );

                linha.appendChild(
                    criarCelula(
                        consulta.modalidade
                    )
                );


                /* SITUAÇÃO */

                const colunaSituacao =
                    document.createElement("td");

                const badge = criarElemento(
                    "span",
                    "admin-status " +
                    classeSituacao(consulta.situacao),
                    consulta.situacao
                );

                colunaSituacao.appendChild(badge);

                linha.appendChild(colunaSituacao);


                /* BOTÃO DETALHES */

                const colunaAcoes =
                    document.createElement("td");

                const botao = criarElemento(
                    "button",
                    "agenda-row-action",
                    "Detalhes"
                );

                botao.type = "button";

                botao.dataset.agendaId =
                    String(consulta.id);

                colunaAcoes.appendChild(botao);

                linha.appendChild(colunaAcoes);

                elementos.tabela.appendChild(linha);
            });

        }


        /* ==========================================
           13. ATUALIZAR INTERFACE INTEIRA
        ========================================== */

        function atualizarAgenda() {

            atualizarIndicadores();

            renderizarCalendario();

            renderizarTabela();

        }


        /* ==========================================
           14. NAVEGAÇÃO ENTRE SEMANAS
        ========================================== */

        elementos.anterior.addEventListener(
            "click",
            () => {

                semanaAtual = adicionarDias(
                    semanaAtual,
                    -7
                );

                atualizarAgenda();
            }
        );

        elementos.proxima.addEventListener(
            "click",
            () => {

                semanaAtual = adicionarDias(
                    semanaAtual,
                    7
                );

                atualizarAgenda();
            }
        );

        elementos.hoje.addEventListener(
            "click",
            () => {

                semanaAtual = inicioDaSemana(
                    dataAtual()
                );

                atualizarAgenda();
            }
        );


        /* ==========================================
           15. FILTROS
        ========================================== */

        [
            elementos.filtroServico,
            elementos.filtroModalidade,
            elementos.filtroStatus
        ].forEach((filtro) => {

            filtro.addEventListener(
                "change",
                atualizarAgenda
            );

        });


        elementos.limparFiltros.addEventListener(
            "click",
            () => {

                elementos.filtroServico.value =
                    "todos";

                elementos.filtroModalidade.value =
                    "todas";

                elementos.filtroStatus.value =
                    "todas";

                atualizarAgenda();
            }
        );


        /* ==========================================
           16. MENSAGENS DO FORMULÁRIO
        ========================================== */

        function mostrarMensagem(
            texto,
            erro = false
        ) {

            elementos.mensagem.textContent =
                texto;

            elementos.mensagem.classList.remove(
                "is-error",
                "is-success"
            );

            elementos.mensagem.classList.add(
                erro ? "is-error" : "is-success"
            );

            elementos.mensagem.hidden = false;
        }


        function limparMensagem() {

            elementos.mensagem.hidden = true;

            elementos.mensagem.textContent = "";

            elementos.mensagem.classList.remove(
                "is-error",
                "is-success"
            );

        }


        /* ==========================================
           17. ABRIR FORMULÁRIO
        ========================================== */

        elementos.novo.addEventListener(
            "click",
            () => {

                elementos.formulario.reset();

                limparMensagem();

                // Usa a data atual quando ela está
                // na semana exibida; caso contrário,
                // usa a segunda-feira dessa semana.

                const hoje = dataAtual();

                const inicioISO = formatarISO(
                    semanaAtual
                );

                const fimISO = formatarISO(
                    adicionarDias(semanaAtual, 6)
                );

                const hojeISO = formatarISO(hoje);

                elementos.data.value =
                    hojeISO >= inicioISO &&
                    hojeISO <= fimISO
                        ? hojeISO
                        : inicioISO;

                elementos.horario.value = "09:00";

                elementos.situacao.value =
                    "Pendente";

                elementos.modal.showModal();

                elementos.paciente.focus();
            }
        );


        /* ==========================================
           18. FECHAR FORMULÁRIO
        ========================================== */

        function fecharFormulario() {

            elementos.modal.close();

            limparMensagem();

        }

        elementos.fecharModal.addEventListener(
            "click",
            fecharFormulario
        );

        elementos.cancelar.addEventListener(
            "click",
            fecharFormulario
        );


        /* ==========================================
           19. VALIDAR NOVO AGENDAMENTO
        ========================================== */

        function validarAgendamento() {

            if (
                !elementos.formulario.checkValidity()
            ) {

                elementos.formulario.reportValidity();

                return null;
            }

            const paciente =
                elementos.paciente.value;

            const servico =
                elementos.servico.value;

            const data =
                elementos.data.value;

            const horario =
                elementos.horario.value;

            const modalidade =
                elementos.modalidade.value;

            const situacao =
                elementos.situacao.value;


            /* VALORES PERMITIDOS */

            const pacientesPermitidos = [
                "Paciente Exemplo 05",
                "Paciente Exemplo 06",
                "Paciente Exemplo 07"
            ];

            const servicosPermitidos = [
                "Saúde Capilar",
                "Clínica Geral",
                "Consulta Online"
            ];

            const modalidadesPermitidas = [
                "Presencial",
                "Online"
            ];

            const situacoesPermitidas = [
                "Pendente",
                "Confirmada"
            ];

            if (
                !pacientesPermitidos.includes(paciente) ||
                !servicosPermitidos.includes(servico) ||
                !modalidadesPermitidas.includes(modalidade) ||
                !situacoesPermitidas.includes(situacao)
            ) {

                mostrarMensagem(
                    "Selecione somente as opções " +
                    "fictícias disponibilizadas.",
                    true
                );

                return null;
            }


            /* DATA VÁLIDA */

            if (!lerDataISO(data)) {

                mostrarMensagem(
                    "Informe uma data válida.",
                    true
                );

                return null;
            }


            /* HORÁRIO VÁLIDO */

            if (
                !/^([01]\d|2[0-3]):[0-5]\d$/.test(
                    horario
                )
            ) {

                mostrarMensagem(
                    "Informe um horário válido.",
                    true
                );

                return null;
            }


            /* COERÊNCIA DE MODALIDADE */

            if (
                servico === "Consulta Online" &&
                modalidade !== "Online"
            ) {

                mostrarMensagem(
                    "Para Consulta Online, " +
                    "selecione a modalidade Online.",
                    true
                );

                return null;
            }


            /* EVITAR HORÁRIO REPETIDO */

            const ocupado = consultas.some(
                consulta => {

                    return (
                        consulta.data === data &&
                        consulta.horario === horario &&
                        consulta.situacao !== "Cancelada"
                    );

                }
            );

            if (ocupado) {

                mostrarMensagem(
                    "Já existe uma consulta fictícia " +
                    "nesse dia e horário. " +
                    "Escolha outro horário.",
                    true
                );

                return null;
            }

            return {
                paciente,
                servico,
                data,
                horario,
                modalidade,
                situacao
            };
        }


        /* ==========================================
           20. CRIAR NOVA CONSULTA FICTÍCIA
        ========================================== */

        elementos.formulario.addEventListener(
            "submit",
            (evento) => {

                evento.preventDefault();

                const dados =
                    validarAgendamento();

                if (!dados) {
                    return;
                }

                const novaConsulta = {

                    id: proximoId++,

                    ...dados

                };

                // Só existe na memória desta página.
                consultas.push(novaConsulta);


                /* MOSTRAR SEMANA DO NOVO REGISTRO */

                semanaAtual = inicioDaSemana(
                    lerDataISO(novaConsulta.data)
                );


                /* LIMPAR FILTROS PARA EXIBI-LO */

                elementos.filtroServico.value =
                    "todos";

                elementos.filtroModalidade.value =
                    "todas";

                elementos.filtroStatus.value =
                    "todas";


                atualizarAgenda();

                elementos.modal.close();

                elementos.formulario.reset();

                limparMensagem();


                /* EXIBIR DETALHES DO NOVO REGISTRO */

                abrirDetalhes(novaConsulta.id);

            }
        );


        /* ==========================================
           21. CRIAR LINHA DE DETALHES
        ========================================== */

        function criarDetalhe(rotulo, valor) {

            const linha = criarElemento(
                "div",
                "agenda-detail-row"
            );

            const nome = criarElemento(
                "span",
                "",
                rotulo
            );

            const conteudo = criarElemento(
                "strong",
                "",
                valor
            );

            linha.appendChild(nome);
            linha.appendChild(conteudo);

            return linha;
        }


        /* ==========================================
           22. ABRIR DETALHES
        ========================================== */

        function abrirDetalhes(id) {

            const consulta = consultas.find(
                item => item.id === id
            );

            if (!consulta) {
                return;
            }

            consultaSelecionadaId = id;

            elementos.detalhesConteudo.replaceChildren();


            const detalhes = [

                ["Paciente", consulta.paciente],

                [
                    "Data",
                    formatarDataCurta(consulta.data)
                ],

                ["Horário", consulta.horario],

                ["Atendimento", consulta.servico],

                ["Modalidade", consulta.modalidade],

                ["Situação", consulta.situacao]

            ];

            detalhes.forEach(([rotulo, valor]) => {

                elementos.detalhesConteudo.appendChild(
                    criarDetalhe(rotulo, valor)
                );

            });


            /* BOTÃO DE CONFIRMAÇÃO */

            const pendente =
                consulta.situacao === "Pendente";

            elementos.detalhesConfirmar.disabled =
                !pendente;

            elementos.detalhesConfirmar.textContent =
                pendente
                    ? "Confirmar simulação"
                    : "Já confirmada";

            elementos.detalhesModal.showModal();

        }


        /* ==========================================
           23. ABRIR DETALHES PELO CALENDÁRIO
               OU PELA TABELA
        ========================================== */

        function cliqueEmConsulta(evento) {

            const botao = evento.target.closest(
                "[data-agenda-id]"
            );

            if (!botao) {
                return;
            }

            const id = Number(
                botao.dataset.agendaId
            );

            if (Number.isInteger(id)) {
                abrirDetalhes(id);
            }
        }

        elementos.semana.addEventListener(
            "click",
            cliqueEmConsulta
        );

        elementos.tabela.addEventListener(
            "click",
            cliqueEmConsulta
        );


        /* ==========================================
           24. FECHAR DETALHES
        ========================================== */

        function fecharDetalhes() {

            consultaSelecionadaId = null;

            elementos.detalhesModal.close();

        }

        elementos.detalhesFechar.addEventListener(
            "click",
            fecharDetalhes
        );

        elementos.detalhesDispensar.addEventListener(
            "click",
            fecharDetalhes
        );


        /* ==========================================
           25. CONFIRMAR CONSULTA FICTÍCIA
        ========================================== */

        elementos.detalhesConfirmar.addEventListener(
            "click",
            () => {

                const consulta = consultas.find(
                    item => (
                        item.id === consultaSelecionadaId
                    )
                );

                if (!consulta) {
                    return;
                }

                if (
                    consulta.situacao !== "Pendente"
                ) {
                    return;
                }

                consulta.situacao = "Confirmada";

                atualizarAgenda();

                fecharDetalhes();

            }
        );


        /* ==========================================
           26. FECHAR AO CLICAR FORA DOS MODAIS
        ========================================== */

        [
            elementos.modal,
            elementos.detalhesModal
        ].forEach((dialogo) => {

            dialogo.addEventListener(
                "click",
                (evento) => {

                    if (evento.target === dialogo) {
                        dialogo.close();
                    }

                }
            );

        });


        /* ==========================================
           27. LIMPEZA DOS MODAIS VIA ESC
        ========================================== */

        elementos.detalhesModal.addEventListener(
            "close",
            () => {

                consultaSelecionadaId = null;

            }
        );

        elementos.modal.addEventListener(
            "close",
            limparMensagem
        );


        /* ==========================================
           28. INICIALIZAR AGENDA
        ========================================== */

        atualizarAgenda();

        console.log(
            "Agenda demonstrativa inicializada. " +
            "Nenhum dado foi armazenado."
        );

    });

})();
