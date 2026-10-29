
/* =====================================================
   DRA. MAURÍCIA MBANI
   RELATÓRIOS ADMINISTRATIVOS

   ARQUIVO: assets/js/relatorios.js

   RECURSOS:
   - Indicadores dinâmicos
   - Filtro por período
   - Filtro por serviço
   - Gráfico mensal
   - Distribuição por serviço
   - Situação dos agendamentos
   - Tabela de resumo mensal
   - Exportação CSV
   - Impressão

   ATENÇÃO:
   Dados inteiramente fictícios.
   Sem integração com outros módulos.
   Sem banco de dados ou pacientes reais.
===================================================== */

(() => {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {

        /* ==========================================
           1. ELEMENTOS DO HTML
        ========================================== */

        const el = {

            periodo: document.getElementById(
                "reports-period-filter"
            ),

            servico: document.getElementById(
                "reports-service-filter"
            ),

            limpar: document.getElementById(
                "reports-clear-filters"
            ),

            exportar: document.getElementById(
                "reports-export-button"
            ),

            imprimir: document.getElementById(
                "reports-print-button"
            ),

            consultas: document.getElementById(
                "reports-appointments-total"
            ),

            pacientes: document.getElementById(
                "reports-patients-total"
            ),

            receita: document.getElementById(
                "reports-revenue-total"
            ),

            confirmadas: document.getElementById(
                "reports-confirmed-total"
            ),

            grafico: document.getElementById(
                "reports-appointments-chart"
            ),

            periodoGrafico: document.getElementById(
                "reports-chart-period"
            ),

            distribuicao: document.getElementById(
                "reports-services-list"
            ),

            statusConfirmadas: document.getElementById(
                "reports-status-confirmed"
            ),

            statusPendentes: document.getElementById(
                "reports-status-pending"
            ),

            statusCanceladas: document.getElementById(
                "reports-status-cancelled"
            ),

            barraStatus: document.getElementById(
                "reports-status-bar"
            ),

            tabela: document.getElementById(
                "reports-table-body"
            ),

            contador: document.getElementById(
                "reports-results-count"
            ),

            vazio: document.getElementById(
                "reports-empty-state"
            )

        };


        /* ==========================================
           2. VALIDAR ELEMENTOS
        ========================================== */

        const ausentes = Object.entries(el)
            .filter(([, elemento]) => !elemento)
            .map(([nome]) => nome);

        if (ausentes.length > 0) {

            console.warn(
                "Relatórios: elementos ausentes:",
                ausentes
            );

            return;
        }


        /* ==========================================
           3. CONFIGURAÇÕES GERAIS
        ========================================== */

        const SERVICOS = [
            "Saúde Capilar",
            "Clínica Geral",
            "Consulta Online"
        ];

        const STATUS = {
            CONFIRMADA: "Confirmada",
            PENDENTE: "Pendente",
            CANCELADA: "Cancelada"
        };

        const nomesMeses = [
            "Janeiro",
            "Fevereiro",
            "Março",
            "Abril",
            "Maio",
            "Junho",
            "Julho",
            "Agosto",
            "Setembro",
            "Outubro",
            "Novembro",
            "Dezembro"
        ];

        const moedaBR = new Intl.NumberFormat(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );


        /* ==========================================
           4. FUNÇÕES AUXILIARES
        ========================================== */

        function criarElemento(
            tag,
            classe = "",
            texto = null
        ) {

            const elemento = document.createElement(
                tag
            );

            if (classe) {
                elemento.className = classe;
            }

            if (texto !== null) {
                elemento.textContent = String(texto);
            }

            return elemento;
        }


        function hojeLocal() {

            const agora = new Date();

            return new Date(
                agora.getFullYear(),
                agora.getMonth(),
                agora.getDate(),
                12
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


        function lerDataISO(valor) {

            const [ano, mes, dia] =
                valor.split("-").map(Number);

            return new Date(
                ano,
                mes - 1,
                dia,
                12
            );

        }


        function moeda(valor) {
            return moedaBR.format(valor);
        }


        function numero(valor) {
            return String(valor).padStart(2, "0");
        }


        function percentual(valor, total) {

            if (total === 0) {
                return 0;
            }

            return valor / total * 100;

        }


        function criarMesChave(data) {

            return formatarISO(data).slice(0, 7);

        }


        function nomeMes(chave, abreviado = false) {

            const [ano, mes] =
                chave.split("-").map(Number);

            const nome = nomesMeses[mes - 1];

            if (abreviado) {
                return nome.slice(0, 3);
            }

            return `${nome}/${ano}`;

        }


        /* ==========================================
           5. BASE FICTÍCIA DE CONSULTAS

           48 consultas distribuídas em 6 meses.

           31 confirmadas
           09 pendentes
           08 canceladas

           24 identificadores fictícios.

           Recebimentos simulados:
           17 registros de R$ 100
           14 registros de R$ 200

           TOTAL: R$ 4.500
        ========================================== */

        const volumeMensal = [
            5, 6, 7, 8, 10, 12
        ];

        const confirmadasMensais = [
            3, 4, 5, 5, 6, 8
        ];

        const pendentesMensais = [
            1, 1, 1, 2, 2, 2
        ];

        const referenciasOnline = [
            2, 7, 11, 16, 21
        ];

        const referenciasGeral = [
            1, 4, 8, 12, 15, 19, 23
        ];

        const consultas = [];

        let proximoId = 1;
        let confirmadasCriadas = 0;
        let indiceGlobal = 0;

        const hoje = hojeLocal();


        /* ==========================================
           6. GERAR OS 48 REGISTROS
        ========================================== */

        for (let mesIndice = 0; mesIndice < 6; mesIndice++) {

            const inicioMes = new Date(
                hoje.getFullYear(),
                hoje.getMonth() - (5 - mesIndice),
                1,
                12
            );

            const quantidade =
                volumeMensal[mesIndice];

            const quantidadeConfirmadas =
                confirmadasMensais[mesIndice];

            const quantidadePendentes =
                pendentesMensais[mesIndice];

            for (let i = 0; i < quantidade; i++) {

                /* DATA FICTÍCIA */

                const ultimoDiaMes = new Date(
                    inicioMes.getFullYear(),
                    inicioMes.getMonth() + 1,
                    0,
                    12
                ).getDate();

                let dia = Math.min(
                    18 + (i % 8),
                    ultimoDiaMes
                );

                // Nenhuma consulta gerada
                // pode estar no futuro.

                if (mesIndice === 5) {

                    dia = Math.min(
                        dia,
                        hoje.getDate()
                    );

                }

                const data = new Date(
                    inicioMes.getFullYear(),
                    inicioMes.getMonth(),
                    dia,
                    12
                );


                /* SITUAÇÃO */

                let situacao;

                if (i < quantidadeConfirmadas) {

                    situacao = STATUS.CONFIRMADA;

                } else if (
                    i <
                    quantidadeConfirmadas +
                    quantidadePendentes
                ) {

                    situacao = STATUS.PENDENTE;

                } else {

                    situacao = STATUS.CANCELADA;

                }


                /* SERVIÇO */

                const referencia =
                    indiceGlobal % 24;

                let servico = "Saúde Capilar";

                if (
                    referenciasOnline.includes(
                        referencia
                    )
                ) {

                    servico = "Consulta Online";

                } else if (
                    referenciasGeral.includes(
                        referencia
                    )
                ) {

                    servico = "Clínica Geral";

                }


                /* RECEBIMENTO FICTÍCIO */

                let recebido = 0;

                if (
                    situacao === STATUS.CONFIRMADA
                ) {

                    recebido =
                        confirmadasCriadas < 17
                            ? 100
                            : 200;

                    confirmadasCriadas++;

                }


                /* REGISTRO */

                consultas.push({

                    id: proximoId++,

                    data: formatarISO(data),

                    pacienteId:
                        (indiceGlobal % 24) + 1,

                    servico,

                    situacao,

                    recebido

                });

                indiceGlobal++;

            }

        }


        /* ==========================================
           7. FILTRAR POR PERÍODO E SERVIÇO
        ========================================== */

        function obterConsultasFiltradas() {

            const periodo =
                el.periodo.value;

            const servico =
                el.servico.value;

            let dataLimite = null;

            if (periodo !== "todos") {

                const dias = Number(periodo);

                dataLimite = new Date(hoje);

                dataLimite.setDate(
                    dataLimite.getDate() - dias
                );

            }

            return consultas.filter((consulta) => {

                const data = lerDataISO(
                    consulta.data
                );

                const correspondePeriodo =
                    dataLimite === null ||
                    (
                        data >= dataLimite &&
                        data <= hoje
                    );

                const correspondeServico =
                    servico === "todos" ||
                    consulta.servico === servico;

                return (
                    correspondePeriodo &&
                    correspondeServico
                );

            });

        }


        /* ==========================================
           8. CALCULAR INDICADORES
        ========================================== */

        function calcularResumo(registros) {

            const total = registros.length;

            const pacientesUnicos = new Set(
                registros.map(
                    item => item.pacienteId
                )
            ).size;

            const confirmadas = registros.filter(
                item => (
                    item.situacao === STATUS.CONFIRMADA
                )
            ).length;

            const pendentes = registros.filter(
                item => (
                    item.situacao === STATUS.PENDENTE
                )
            ).length;

            const canceladas = registros.filter(
                item => (
                    item.situacao === STATUS.CANCELADA
                )
            ).length;

            const recebido = registros.reduce(
                (total, item) => {
                    return total + item.recebido;
                },
                0
            );

            return {
                total,
                pacientesUnicos,
                confirmadas,
                pendentes,
                canceladas,
                recebido
            };

        }


        /* ==========================================
           9. ATUALIZAR INDICADORES
        ========================================== */

        function atualizarIndicadores(resumo) {

            el.consultas.textContent =
                numero(resumo.total);

            el.pacientes.textContent =
                numero(resumo.pacientesUnicos);

            el.receita.textContent =
                moeda(resumo.recebido);

            el.confirmadas.textContent =
                numero(resumo.confirmadas);

            el.statusConfirmadas.textContent =
                numero(resumo.confirmadas);

            el.statusPendentes.textContent =
                numero(resumo.pendentes);

            el.statusCanceladas.textContent =
                numero(resumo.canceladas);

        }


        /* ==========================================
           10. AGRUPAR POR MÊS
        ========================================== */

        function agruparPorMes(registros) {

            const agrupados = new Map();

            registros.forEach((item) => {

                const chave =
                    item.data.slice(0, 7);

                if (!agrupados.has(chave)) {

                    agrupados.set(chave, {
                        chave,
                        consultas: 0,
                        confirmadas: 0,
                        pendentes: 0,
                        canceladas: 0,
                        recebido: 0
                    });

                }

                const grupo =
                    agrupados.get(chave);

                grupo.consultas++;

                grupo.recebido += item.recebido;

                if (
                    item.situacao === STATUS.CONFIRMADA
                ) {
                    grupo.confirmadas++;
                }

                if (
                    item.situacao === STATUS.PENDENTE
                ) {
                    grupo.pendentes++;
                }

                if (
                    item.situacao === STATUS.CANCELADA
                ) {
                    grupo.canceladas++;
                }

            });

            return Array.from(
                agrupados.values()
            ).sort(
                (a, b) => a.chave.localeCompare(b.chave)
            );

        }


        /* ==========================================
           11. GRÁFICO MENSAL DINÂMICO
        ========================================== */

        function atualizarGrafico(meses) {

            const fragmento =
                document.createDocumentFragment();

            const maior = Math.max(
                1,
                ...meses.map(
                    mes => mes.consultas
                )
            );

            meses.forEach((mes, indice) => {

                const coluna = criarElemento(
                    "div",
                    "reports-chart-month"
                );

                const envoltorio = criarElemento(
                    "div",
                    "reports-chart-bar-wrap"
                );

                const destaque =
                    indice === meses.length - 1
                        ? " highlight"
                        : "";

                const barra = criarElemento(
                    "span",
                    "reports-chart-bar" + destaque
                );

                const altura = percentual(
                    mes.consultas,
                    maior
                );

                barra.style.setProperty(
                    "--bar-height",
                    altura + "%"
                );

                barra.title =
                    `${nomeMes(mes.chave)}: ` +
                    `${mes.consultas} consultas fictícias`;

                envoltorio.appendChild(barra);

                coluna.appendChild(envoltorio);

                coluna.appendChild(
                    criarElemento(
                        "small",
                        "",
                        nomeMes(mes.chave, true)
                    )
                );

                fragmento.appendChild(coluna);

            });


            /* SEM DADOS */

            if (meses.length === 0) {

                fragmento.appendChild(
                    criarElemento(
                        "p",
                        "",
                        "Sem registros para o filtro."
                    )
                );

            }

            el.grafico.style.gridTemplateColumns =
                meses.length
                    ? `repeat(${meses.length}, minmax(0, 1fr))`
                    : "1fr";

            el.grafico.replaceChildren(fragmento);


            /* DESCRIÇÃO ACESSÍVEL */

            const descricao = meses.map(
                mes => (
                    `${nomeMes(mes.chave)}: ` +
                    `${mes.consultas} consultas`
                )
            ).join("; ");

            el.grafico.setAttribute(
                "aria-label",
                descricao ||
                "Nenhuma consulta encontrada."
            );


            /* PERÍODO DO GRÁFICO */

            const opcaoSelecionada =
                el.periodo.options[
                    el.periodo.selectedIndex
                ];

            el.periodoGrafico.textContent =
                opcaoSelecionada.textContent.trim();

        }


        /* ==========================================
           12. DISTRIBUIÇÃO POR SERVIÇO
        ========================================== */

        function atualizarDistribuicao(registros) {

            const total = registros.length;

            const configuracoes = [
                {
                    nome: "Saúde Capilar",
                    classe: "capilar"
                },
                {
                    nome: "Clínica Geral",
                    classe: "geral"
                },
                {
                    nome: "Consulta Online",
                    classe: "online"
                }
            ];

            const fragmento =
                document.createDocumentFragment();

            configuracoes.forEach((servico) => {

                const quantidade = registros.filter(
                    item => (
                        item.servico === servico.nome
                    )
                ).length;

                const porcentagem = percentual(
                    quantidade,
                    total
                );

                const item = criarElemento(
                    "div",
                    "reports-service-item"
                );

                const cabecalho = criarElemento(
                    "div",
                    "reports-service-heading"
                );

                cabecalho.appendChild(
                    criarElemento(
                        "span",
                        "",
                        servico.nome
                    )
                );

                cabecalho.appendChild(
                    criarElemento(
                        "strong",
                        "",
                        porcentagem.toFixed(1)
                            .replace(".", ",") + "%"
                    )
                );

                const trilha = criarElemento(
                    "div",
                    "reports-service-track"
                );

                const barra = criarElemento(
                    "span",
                    "reports-service-fill " +
                        servico.classe
                );

                barra.style.width =
                    porcentagem + "%";

                trilha.appendChild(barra);

                item.appendChild(cabecalho);

                item.appendChild(trilha);

                fragmento.appendChild(item);

            });

            el.distribuicao.replaceChildren(
                fragmento
            );

        }


        /* ==========================================
           13. SITUAÇÃO DOS AGENDAMENTOS
        ========================================== */

        function atualizarBarraStatus(resumo) {

            const valores = [

                {
                    classe: "confirmed",
                    quantidade: resumo.confirmadas
                },

                {
                    classe: "pending",
                    quantidade: resumo.pendentes
                },

                {
                    classe: "cancelled",
                    quantidade: resumo.canceladas
                }

            ];

            const fragmento =
                document.createDocumentFragment();

            valores.forEach((item) => {

                const barra = criarElemento(
                    "span",
                    item.classe
                );

                barra.style.width =
                    percentual(
                        item.quantidade,
                        resumo.total
                    ) + "%";

                fragmento.appendChild(barra);

            });

            el.barraStatus.replaceChildren(
                fragmento
            );

            el.barraStatus.setAttribute(
                "aria-label",
                `${resumo.confirmadas} confirmadas, ` +
                `${resumo.pendentes} pendentes e ` +
                `${resumo.canceladas} canceladas.`
            );

        }


        /* ==========================================
           14. TABELA POR PERÍODO
        ========================================== */

        function criarCelula(
            texto,
            destaque = false
        ) {

            const td = document.createElement(
                "td"
            );

            if (destaque) {

                td.appendChild(
                    criarElemento(
                        "strong",
                        "",
                        texto
                    )
                );

            } else {

                td.textContent = String(texto);

            }

            return td;

        }


        function atualizarTabela(meses) {

            const fragmento =
                document.createDocumentFragment();

            const mesesRecentes = [...meses].reverse();

            mesesRecentes.forEach((mes) => {

                const linha =
                    document.createElement("tr");

                linha.appendChild(
                    criarCelula(
                        nomeMes(mes.chave),
                        true
                    )
                );

                linha.appendChild(
                    criarCelula(mes.consultas)
                );

                linha.appendChild(
                    criarCelula(mes.confirmadas)
                );

                linha.appendChild(
                    criarCelula(mes.pendentes)
                );

                linha.appendChild(
                    criarCelula(mes.canceladas)
                );

                linha.appendChild(
                    criarCelula(
                        moeda(mes.recebido)
                    )
                );

                fragmento.appendChild(linha);

            });

            el.tabela.replaceChildren(fragmento);

            el.contador.textContent =
                meses.length +
                (
                    meses.length === 1
                        ? " período"
                        : " períodos"
                );

            el.vazio.hidden =
                meses.length !== 0;

        }


        /* ==========================================
           15. ESTADO DA PÁGINA
        ========================================== */

        let dadosAtuais = [];
        let mesesAtuais = [];

        function atualizarRelatorios() {

            dadosAtuais =
                obterConsultasFiltradas();

            mesesAtuais =
                agruparPorMes(dadosAtuais);

            const resumo =
                calcularResumo(dadosAtuais);

            atualizarIndicadores(resumo);

            atualizarGrafico(mesesAtuais);

            atualizarDistribuicao(dadosAtuais);

            atualizarBarraStatus(resumo);

            atualizarTabela(mesesAtuais);


            /* HABILITAR AÇÕES */

            const possuiDados =
                dadosAtuais.length > 0;

            el.exportar.disabled = !possuiDados;

            el.imprimir.disabled = !possuiDados;


            /* LIMPAR FILTROS */

            el.limpar.disabled = (
                el.periodo.value === "180" &&
                el.servico.value === "todos"
            );

        }


        /* ==========================================
           16. EVENTOS DOS FILTROS
        ========================================== */

        el.periodo.addEventListener(
            "change",
            atualizarRelatorios
        );

        el.servico.addEventListener(
            "change",
            atualizarRelatorios
        );


        /* ==========================================
           17. LIMPAR FILTROS
        ========================================== */

        el.limpar.addEventListener(
            "click",
            () => {

                el.periodo.value = "180";

                el.servico.value = "todos";

                atualizarRelatorios();

            }
        );


        /* ==========================================
           18. EXPORTAR CSV

           A exportação contém os mesmos
           totais e períodos da tabela exibida.
        ========================================== */

        function escaparCSV(valor) {

            const texto = String(valor);

            // Proteção adicional contra
            // interpretação como fórmula
            // em aplicativos de planilhas.

            const seguro = /^[=+\-@\t\r]/.test(texto)
                ? "'" + texto
                : texto;

            return '"' +
                seguro.replace(/"/g, '""') +
                '"';

        }


        function criarLinhaCSV(colunas) {

            return colunas.map(
                escaparCSV
            ).join(";");

        }


        function exportarCSV() {

            if (dadosAtuais.length === 0) {
                return;
            }

            const resumo =
                calcularResumo(dadosAtuais);

            const periodo =
                el.periodo.options[
                    el.periodo.selectedIndex
                ].textContent.trim();

            const servico =
                el.servico.options[
                    el.servico.selectedIndex
                ].textContent.trim();

            const linhas = [

                criarLinhaCSV([
                    "RELATÓRIO DEMONSTRATIVO",
                    "Dra. Maurícia Mbani"
                ]),

                criarLinhaCSV([
                    "Observação",
                    "Dados inteiramente fictícios"
                ]),

                criarLinhaCSV([
                    "Período",
                    periodo
                ]),

                criarLinhaCSV([
                    "Serviço",
                    servico
                ]),

                "",

                criarLinhaCSV([
                    "Mês",
                    "Consultas",
                    "Confirmadas",
                    "Pendentes",
                    "Canceladas",
                    "Recebimentos fictícios (R$)"
                ])

            ];


            /* RESUMO MENSAL */

            [...mesesAtuais].reverse().forEach(
                mes => {

                    linhas.push(
                        criarLinhaCSV([
                            nomeMes(mes.chave),
                            mes.consultas,
                            mes.confirmadas,
                            mes.pendentes,
                            mes.canceladas,
                            mes.recebido.toFixed(2)
                                .replace(".", ",")
                        ])
                    );

                }
            );


            /* TOTAIS */

            linhas.push(
                criarLinhaCSV([
                    "TOTAL",
                    resumo.total,
                    resumo.confirmadas,
                    resumo.pendentes,
                    resumo.canceladas,
                    resumo.recebido.toFixed(2)
                        .replace(".", ",")
                ])
            );

            linhas.push("");

            linhas.push(
                criarLinhaCSV([
                    "Pacientes fictícios distintos",
                    resumo.pacientesUnicos
                ])
            );


            /* CRIAR ARQUIVO */

            const conteudo =
                "\uFEFF" + linhas.join("\r\n");

            const arquivo = new Blob(
                [conteudo],
                {
                    type: "text/csv;charset=utf-8;"
                }
            );

            const url = URL.createObjectURL(
                arquivo
            );

            const link = document.createElement(
                "a"
            );

            link.href = url;

            link.download =
                "relatorio-demo-mauricia-" +
                formatarISO(hoje) +
                ".csv";

            document.body.appendChild(link);

            link.click();

            link.remove();

            // Libera a URL temporária
            // após iniciar o download.

            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 1000);

        }

        el.exportar.addEventListener(
            "click",
            exportarCSV
        );


        /* ==========================================
           19. IMPRESSÃO DO RELATÓRIO
        ========================================== */

        el.imprimir.addEventListener(
            "click",
            () => {

                if (dadosAtuais.length === 0) {
                    return;
                }

                window.print();

            }
        );


        /* ==========================================
           20. ATUALIZAR TEXTOS AUXILIARES
        ========================================== */

        const descricaoFiltros =
            document.querySelector(
                ".reports-filter-description"
            );

        if (descricaoFiltros) {

            descricaoFiltros.textContent =
                "Os indicadores e gráficos são " +
                "atualizados conforme os filtros. " +
                "Todos os valores são fictícios.";

        }

        const notaTabela =
            document.querySelector(
                ".reports-table-panel " +
                ".reports-panel-footnote"
            );

        if (notaTabela) {

            notaTabela.textContent =
                "Resumo calculado a partir da mesma " +
                "base fictícia exibida nos gráficos.";

        }


        /* ==========================================
           21. INICIALIZAR MÓDULO
        ========================================== */

        atualizarRelatorios();

        console.log(
            "Relatórios demonstrativos carregados. " +
            `${consultas.length} consultas fictícias.`
        );

    });

})();
