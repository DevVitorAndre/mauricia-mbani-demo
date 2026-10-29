
/* =====================================================
   DRA. MAURÍCIA MBANI
   FINANCEIRO ADMINISTRATIVO

   ARQUIVO: assets/js/financeiro.js

   AMBIENTE DEMONSTRATIVO
   - Dados inteiramente fictícios
   - Sem API de pagamentos
   - Sem integração bancária
   - Sem armazenamento permanente
===================================================== */

(() => {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {

        /* ==========================================
           1. ELEMENTOS DA INTERFACE
        ========================================== */

        const el = {

            receita: document.getElementById(
                "finance-total-revenue"
            ),

            pagos: document.getElementById(
                "finance-paid-total"
            ),

            pendentes: document.getElementById(
                "finance-pending-total"
            ),

            quantidade: document.getElementById(
                "finance-transactions-count"
            ),

            grafico: document.getElementById(
                "finance-chart"
            ),

            busca: document.getElementById(
                "finance-search"
            ),

            filtroStatus: document.getElementById(
                "finance-status-filter"
            ),

            filtroMetodo: document.getElementById(
                "finance-method-filter"
            ),

            filtroPeriodo: document.getElementById(
                "finance-period-filter"
            ),

            limparFiltros: document.getElementById(
                "finance-clear-filters"
            ),

            tabela: document.getElementById(
                "finance-table-body"
            ),

            contador: document.getElementById(
                "finance-results-count"
            ),

            vazio: document.getElementById(
                "finance-empty-state"
            ),

            botaoNovo: document.getElementById(
                "finance-new-button"
            ),

            modal: document.getElementById(
                "finance-modal"
            ),

            fecharModal: document.getElementById(
                "finance-modal-close"
            ),

            cancelar: document.getElementById(
                "finance-form-cancel"
            ),

            formulario: document.getElementById(
                "finance-form"
            ),

            paciente: document.getElementById(
                "finance-form-patient"
            ),

            servico: document.getElementById(
                "finance-form-service"
            ),

            data: document.getElementById(
                "finance-form-date"
            ),

            valor: document.getElementById(
                "finance-form-value"
            ),

            metodo: document.getElementById(
                "finance-form-method"
            ),

            situacao: document.getElementById(
                "finance-form-status"
            ),

            mensagem: document.getElementById(
                "finance-form-message"
            ),

            modalDetalhes: document.getElementById(
                "finance-details-modal"
            ),

            conteudoDetalhes: document.getElementById(
                "finance-details-content"
            ),

            fecharDetalhes: document.getElementById(
                "finance-details-close"
            ),

            dispensarDetalhes: document.getElementById(
                "finance-details-dismiss"
            ),

            confirmarPagamento: document.getElementById(
                "finance-details-confirm"
            )

        };


        /* ==========================================
           2. VALIDAR ELEMENTOS DO HTML
        ========================================== */

        const ausentes = Object.entries(el)
            .filter(([, elemento]) => !elemento)
            .map(([nome]) => nome);

        if (ausentes.length > 0) {

            console.warn(
                "Financeiro: elementos ausentes:",
                ausentes
            );

            return;
        }


        /* ==========================================
           3. FUNÇÕES DE DATAS

           Usamos datas locais para evitar
           problemas de fuso horário.
        ========================================== */

        function hoje() {

            const agora = new Date();

            return new Date(
                agora.getFullYear(),
                agora.getMonth(),
                agora.getDate(),
                12
            );

        }


        function dataISO(data) {

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

            if (
                !/^\d{4}-\d{2}-\d{2}$/.test(valor)
            ) {
                return null;
            }

            const [ano, mes, dia] =
                valor.split("-").map(Number);

            const data = new Date(
                ano,
                mes - 1,
                dia,
                12
            );

            if (
                data.getFullYear() !== ano ||
                data.getMonth() !== mes - 1 ||
                data.getDate() !== dia
            ) {
                return null;
            }

            return data;

        }


        function formatarData(valor) {

            const data = lerDataISO(valor);

            if (!data) {
                return "Data inválida";
            }

            return new Intl.DateTimeFormat(
                "pt-BR"
            ).format(data);

        }


        function dataEmMes(
            deslocamento,
            dia = 12
        ) {

            const referencia = hoje();

            const inicioMes = new Date(
                referencia.getFullYear(),
                referencia.getMonth() + deslocamento,
                1,
                12
            );

            const ultimoDia = new Date(
                inicioMes.getFullYear(),
                inicioMes.getMonth() + 1,
                0,
                12
            ).getDate();

            inicioMes.setDate(
                Math.min(dia, ultimoDia)
            );

            return dataISO(inicioMes);

        }


        function inicioDoMes(data) {

            return new Date(
                data.getFullYear(),
                data.getMonth(),
                1,
                12
            );

        }


        /* ==========================================
           4. FORMATAÇÃO DE VALORES
        ========================================== */

        const formatoMoeda = new Intl.NumberFormat(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

        const formatoMes = new Intl.DateTimeFormat(
            "pt-BR",
            {
                month: "short"
            }
        );


        function moeda(valor) {

            return formatoMoeda.format(valor);

        }


        function codigo(id) {

            return (
                "DEMO-" +
                String(id).padStart(3, "0")
            );

        }


        function textoNormalizado(valor) {

            return String(valor)
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .trim();

        }


        /* ==========================================
           5. TRANSAÇÕES FICTÍCIAS

           PAGAS:      R$ 4.500
           PENDENTES:  R$ 1.500
           TOTAL:      R$ 6.000

           Uma transação cancelada não
           entra nos totais financeiros.
        ========================================== */

        const transacoes = [

            {
                id: 1,
                data: dataEmMes(-5, 12),
                referencia: "Paciente Exemplo 01",
                servico: "Saúde Capilar",
                metodo: "PIX",
                valor: 600,
                situacao: "Pago"
            },

            {
                id: 2,
                data: dataEmMes(-4, 15),
                referencia: "Paciente Exemplo 02",
                servico: "Clínica Geral",
                metodo: "Crédito",
                valor: 550,
                situacao: "Pago"
            },

            {
                id: 3,
                data: dataEmMes(-3, 11),
                referencia: "Paciente Exemplo 03",
                servico: "Consulta Online",
                metodo: "PIX",
                valor: 500,
                situacao: "Pago"
            },

            {
                id: 4,
                data: dataEmMes(-2, 14),
                referencia: "Paciente Exemplo 04",
                servico: "Saúde Capilar",
                metodo: "Débito",
                valor: 450,
                situacao: "Pago"
            },

            {
                id: 5,
                data: dataEmMes(-1, 18),
                referencia: "Paciente Exemplo 05",
                servico: "Clínica Geral",
                metodo: "PIX",
                valor: 700,
                situacao: "Pago"
            },

            {
                id: 6,
                data: dataEmMes(0, 10),
                referencia: "Paciente Exemplo 06",
                servico: "Saúde Capilar",
                metodo: "Crédito",
                valor: 800,
                situacao: "Pago"
            },

            {
                id: 7,
                data: dataEmMes(0, 16),
                referencia: "Paciente Exemplo 07",
                servico: "Consulta Online",
                metodo: "PIX",
                valor: 900,
                situacao: "Pago"
            },

            {
                id: 8,
                data: dataEmMes(-3, 20),
                referencia: "Paciente Exemplo 08",
                servico: "Saúde Capilar",
                metodo: "Crédito",
                valor: 350,
                situacao: "Pendente"
            },

            {
                id: 9,
                data: dataEmMes(-2, 21),
                referencia: "Paciente Exemplo 09",
                servico: "Clínica Geral",
                metodo: "PIX",
                valor: 400,
                situacao: "Pendente"
            },

            {
                id: 10,
                data: dataEmMes(-1, 22),
                referencia: "Paciente Exemplo 10",
                servico: "Consulta Online",
                metodo: "Débito",
                valor: 300,
                situacao: "Pendente"
            },

            {
                id: 11,
                data: dataEmMes(0, 20),
                referencia: "Paciente Exemplo 11",
                servico: "Saúde Capilar",
                metodo: "Dinheiro",
                valor: 450,
                situacao: "Pendente"
            },

            {
                id: 12,
                data: dataEmMes(0, 23),
                referencia: "Paciente Exemplo 12",
                servico: "Clínica Geral",
                metodo: "PIX",
                valor: 200,
                situacao: "Cancelado"
            }

        ];

        let proximoId = 13;

        let transacaoSelecionada = null;


        /* ==========================================
           6. ELEMENTOS DINÂMICOS
        ========================================== */

        function criarElemento(
            tag,
            classe = "",
            texto = ""
        ) {

            const elemento =
                document.createElement(tag);

            if (classe) {
                elemento.className = classe;
            }

            elemento.textContent = String(texto);

            return elemento;

        }


        function classeSituacao(situacao) {

            if (situacao === "Pago") {
                return "paid";
            }

            if (situacao === "Pendente") {
                return "pending";
            }

            return "cancelled";

        }


        function somarValores(registros) {

            return registros.reduce(
                (total, item) => {
                    return total + item.valor;
                },
                0
            );

        }


        /* ==========================================
           7. ATUALIZAR INDICADORES
        ========================================== */

        function atualizarIndicadores() {

            const pagos = transacoes.filter(
                item => item.situacao === "Pago"
            );

            const pendentes = transacoes.filter(
                item => item.situacao === "Pendente"
            );

            const totalPago =
                somarValores(pagos);

            const totalPendente =
                somarValores(pendentes);

            const receita =
                totalPago + totalPendente;

            el.receita.textContent =
                moeda(receita);

            el.pagos.textContent =
                moeda(totalPago);

            el.pendentes.textContent =
                moeda(totalPendente);

            el.quantidade.textContent =
                String(transacoes.length).padStart(
                    2,
                    "0"
                );

        }


        /* ==========================================
           8. FILTRO DE PERÍODO
        ========================================== */

        function dentroDoPeriodo(transacao) {

            const periodo =
                el.filtroPeriodo.value;

            if (periodo === "todos") {
                return true;
            }

            const data =
                lerDataISO(transacao.data);

            if (!data) {
                return false;
            }

            const atual = hoje();

            if (periodo === "mes") {

                return (
                    data.getFullYear() ===
                        atual.getFullYear() &&

                    data.getMonth() ===
                        atual.getMonth()
                );

            }

            if (periodo === "anterior") {

                const anterior = new Date(
                    atual.getFullYear(),
                    atual.getMonth() - 1,
                    1,
                    12
                );

                return (
                    data.getFullYear() ===
                        anterior.getFullYear() &&

                    data.getMonth() ===
                        anterior.getMonth()
                );

            }

            if (periodo === "90dias") {

                const limite = new Date(atual);

                limite.setDate(
                    limite.getDate() - 90
                );

                return (
                    data >= limite &&
                    data <= atual
                );

            }

            return true;

        }


        /* ==========================================
           9. BUSCA E FILTROS
        ========================================== */

        function obterFiltradas() {

            const pesquisa = textoNormalizado(
                el.busca.value
            );

            const situacao =
                el.filtroStatus.value;

            const metodo =
                el.filtroMetodo.value;

            return transacoes.filter((item) => {

                const correspondePesquisa =
                    !pesquisa ||

                    textoNormalizado(
                        codigo(item.id)
                    ).includes(pesquisa) ||

                    textoNormalizado(
                        item.referencia
                    ).includes(pesquisa);

                const correspondeSituacao =
                    situacao === "todos" ||
                    item.situacao === situacao;

                const correspondeMetodo =
                    metodo === "todos" ||
                    item.metodo === metodo;

                return (
                    correspondePesquisa &&
                    correspondeSituacao &&
                    correspondeMetodo &&
                    dentroDoPeriodo(item)
                );

            }).sort((a, b) => {

                return (
                    b.data.localeCompare(a.data) ||
                    b.id - a.id
                );

            });

        }


        /* ==========================================
           10. RENDERIZAR TABELA
        ========================================== */

        function criarCelula(texto, destaque = false) {

            const td =
                document.createElement("td");

            if (destaque) {

                td.appendChild(
                    criarElemento(
                        "strong",
                        "",
                        texto
                    )
                );

            } else {

                td.textContent = texto;

            }

            return td;

        }


        function criarLinha(item) {

            const linha =
                document.createElement("tr");

            linha.appendChild(
                criarCelula(
                    codigo(item.id),
                    true
                )
            );

            linha.appendChild(
                criarCelula(
                    formatarData(item.data)
                )
            );

            linha.appendChild(
                criarCelula(item.referencia)
            );

            linha.appendChild(
                criarCelula(item.servico)
            );

            linha.appendChild(
                criarCelula(item.metodo)
            );

            linha.appendChild(
                criarCelula(
                    moeda(item.valor),
                    true
                )
            );


            /* SITUAÇÃO */

            const colunaSituacao =
                document.createElement("td");

            colunaSituacao.appendChild(
                criarElemento(
                    "span",
                    "finance-status " +
                        classeSituacao(item.situacao),
                    item.situacao
                )
            );

            linha.appendChild(colunaSituacao);


            /* BOTÃO DE DETALHES */

            const colunaAcao =
                document.createElement("td");

            const botao = criarElemento(
                "button",
                "finance-detail-button",
                "Detalhes"
            );

            botao.type = "button";

            botao.dataset.financeId =
                String(item.id);

            botao.setAttribute(
                "aria-label",
                "Ver detalhes da transação " +
                codigo(item.id)
            );

            colunaAcao.appendChild(botao);

            linha.appendChild(colunaAcao);

            return linha;

        }


        function renderizarTabela() {

            const registros = obterFiltradas();

            const fragmento =
                document.createDocumentFragment();

            registros.forEach((item) => {

                fragmento.appendChild(
                    criarLinha(item)
                );

            });

            el.tabela.replaceChildren(fragmento);

            el.contador.textContent =
                registros.length +
                (
                    registros.length === 1
                        ? " registro fictício"
                        : " registros fictícios"
                );

            el.vazio.hidden =
                registros.length !== 0;

        }


        /* ==========================================
           11. GRÁFICO DOS ÚLTIMOS 6 MESES
        ========================================== */

        function atualizarGrafico() {

            const meses = [];

            const atual = hoje();

            for (let i = 5; i >= 0; i--) {

                const data = new Date(
                    atual.getFullYear(),
                    atual.getMonth() - i,
                    1,
                    12
                );

                meses.push({
                    data,
                    chave:
                        data.getFullYear() + "-" +
                        String(
                            data.getMonth() + 1
                        ).padStart(2, "0"),
                    pagos: 0,
                    pendentes: 0
                });

            }


            /* AGRUPAR VALORES POR MÊS */

            transacoes.forEach((item) => {

                const mes =
                    item.data.slice(0, 7);

                const grupo = meses.find(
                    registro =>
                        registro.chave === mes
                );

                if (!grupo) {
                    return;
                }

                if (item.situacao === "Pago") {

                    grupo.pagos += item.valor;

                } else if (
                    item.situacao === "Pendente"
                ) {

                    grupo.pendentes += item.valor;

                }

            });


            /* ESCALA DO GRÁFICO */

            const maiorValor = Math.max(
                1,
                ...meses.flatMap(
                    mes => [
                        mes.pagos,
                        mes.pendentes
                    ]
                )
            );


            /* CONSTRUIR COLUNAS */

            const fragmento =
                document.createDocumentFragment();

            meses.forEach((mes) => {

                const coluna = criarElemento(
                    "div",
                    "finance-chart-month"
                );

                const barras = criarElemento(
                    "div",
                    "finance-chart-bars"
                );


                function criarBarra(
                    valor,
                    classe
                ) {

                    const barra = criarElemento(
                        "span",
                        "finance-chart-bar " + classe
                    );

                    const percentual =
                        valor === 0
                            ? 0
                            : Math.max(
                                6,
                                valor / maiorValor * 100
                            );

                    barra.style.setProperty(
                        "--bar-height",
                        percentual + "%"
                    );

                    barra.hidden = valor === 0;

                    barra.title = moeda(valor);

                    return barra;

                }


                barras.appendChild(
                    criarBarra(
                        mes.pagos,
                        "paid"
                    )
                );

                barras.appendChild(
                    criarBarra(
                        mes.pendentes,
                        "pending"
                    )
                );


                const nomeMes = formatoMes.format(
                    mes.data
                ).replace(".", "");

                coluna.appendChild(barras);

                coluna.appendChild(
                    criarElemento(
                        "small",
                        "",
                        nomeMes
                    )
                );

                fragmento.appendChild(coluna);

            });

            el.grafico.replaceChildren(fragmento);


            /* DESCRIÇÃO ACESSÍVEL */

            const descricao = meses.map(
                mes => {

                    const nome =
                        formatoMes.format(mes.data);

                    return (
                        `${nome}: ` +
                        `${moeda(mes.pagos)} pagos, ` +
                        `${moeda(mes.pendentes)} pendentes`
                    );

                }
            ).join("; ");

            el.grafico.setAttribute(
                "aria-label",
                "Valores fictícios por mês. " +
                descricao
            );

        }


        /* ==========================================
           12. FORMAS DE PAGAMENTO

           Percentuais calculados pela
           quantidade de registros ativos.
        ========================================== */

        function atualizarMetodos() {

            const registros = transacoes.filter(
                item => item.situacao !== "Cancelado"
            );

            const total = registros.length;

            const metodos = [
                {
                    nome: "PIX",
                    classe: "pix"
                },
                {
                    nome: "Crédito",
                    classe: "credit"
                },
                {
                    nome: "Débito",
                    classe: "debit"
                },
                {
                    nome: "Dinheiro",
                    classe: "cash"
                }
            ];

            metodos.forEach((metodo) => {

                const quantidade = registros.filter(
                    item => item.metodo === metodo.nome
                ).length;

                const percentual =
                    total > 0
                        ? quantidade / total * 100
                        : 0;

                const barra =
                    document.querySelector(
                        ".finance-method-fill." +
                        metodo.classe
                    );

                if (!barra) {
                    return;
                }

                barra.style.width =
                    percentual.toFixed(1) + "%";

                const item =
                    barra.closest(
                        ".finance-method-item"
                    );

                const numero = item?.querySelector(
                    ".finance-method-heading strong"
                );

                if (numero) {

                    numero.textContent =
                        Math.round(percentual) + "%";

                }

            });

        }


        /* ==========================================
           13. ATUALIZAÇÃO GERAL
        ========================================== */

        function atualizarFinanceiro() {

            atualizarIndicadores();

            renderizarTabela();

            atualizarGrafico();

            atualizarMetodos();

        }


        /* ==========================================
           14. EVENTOS DOS FILTROS
        ========================================== */

        el.busca.addEventListener(
            "input",
            renderizarTabela
        );

        [
            el.filtroStatus,
            el.filtroMetodo,
            el.filtroPeriodo
        ].forEach((filtro) => {

            filtro.addEventListener(
                "change",
                renderizarTabela
            );

        });


        /* ==========================================
           15. LIMPAR FILTROS
        ========================================== */

        function limparFiltros() {

            el.busca.value = "";

            el.filtroStatus.value = "todos";

            el.filtroMetodo.value = "todos";

            el.filtroPeriodo.value = "todos";

            renderizarTabela();

        }

        el.limparFiltros.addEventListener(
            "click",
            limparFiltros
        );


        /* ==========================================
           16. FEEDBACK DO FORMULÁRIO
        ========================================== */

        function mensagem(
            texto,
            erro = false
        ) {

            el.mensagem.hidden = false;

            el.mensagem.textContent = texto;

            el.mensagem.classList.remove(
                "is-error",
                "is-success"
            );

            el.mensagem.classList.add(
                erro ? "is-error" : "is-success"
            );

        }


        function limparMensagem() {

            el.mensagem.hidden = true;

            el.mensagem.textContent = "";

            el.mensagem.classList.remove(
                "is-error",
                "is-success"
            );

        }


        /* ==========================================
           17. ABRIR NOVA TRANSAÇÃO
        ========================================== */

        function abrirFormulario() {

            el.formulario.reset();

            limparMensagem();

            el.data.value = dataISO(
                hoje()
            );

            el.situacao.value = "Pendente";

            el.modal.showModal();

            el.paciente.focus();

        }

        el.botaoNovo.addEventListener(
            "click",
            abrirFormulario
        );


        /* ==========================================
           18. FECHAR FORMULÁRIO
        ========================================== */

        function fecharFormulario() {

            el.modal.close();

            limparMensagem();

        }

        el.fecharModal.addEventListener(
            "click",
            fecharFormulario
        );

        el.cancelar.addEventListener(
            "click",
            fecharFormulario
        );


        /* ==========================================
           19. VALIDAÇÃO DO LANÇAMENTO
        ========================================== */

        function validarFormulario() {

            if (!el.formulario.checkValidity()) {

                el.formulario.reportValidity();

                return null;
            }

            const dados = {

                referencia: el.paciente.value,

                servico: el.servico.value,

                data: el.data.value,

                valor: Number(
                    el.valor.value
                ),

                metodo: el.metodo.value,

                situacao: el.situacao.value

            };


            /* REFERÊNCIAS FICTÍCIAS */

            const referenciasPermitidas = [
                "Paciente Exemplo 09",
                "Paciente Exemplo 10",
                "Paciente Exemplo 11",
                "Paciente Exemplo 12"
            ];

            const servicosPermitidos = [
                "Saúde Capilar",
                "Clínica Geral",
                "Consulta Online"
            ];

            const valoresPermitidos = [
                150,
                250,
                350,
                450,
                600
            ];

            const metodosPermitidos = [
                "PIX",
                "Crédito",
                "Débito",
                "Dinheiro"
            ];

            const situacoesPermitidas = [
                "Pago",
                "Pendente",
                "Cancelado"
            ];


            if (
                !referenciasPermitidas.includes(
                    dados.referencia
                ) ||

                !servicosPermitidos.includes(
                    dados.servico
                ) ||

                !valoresPermitidos.includes(
                    dados.valor
                ) ||

                !metodosPermitidos.includes(
                    dados.metodo
                ) ||

                !situacoesPermitidas.includes(
                    dados.situacao
                )
            ) {

                mensagem(
                    "Selecione apenas as opções " +
                    "demonstrativas disponíveis.",
                    true
                );

                return null;

            }


            if (!lerDataISO(dados.data)) {

                mensagem(
                    "Informe uma data válida.",
                    true
                );

                return null;

            }

            return dados;

        }


        /* ==========================================
           20. SALVAR TRANSAÇÃO FICTÍCIA
        ========================================== */

        el.formulario.addEventListener(
            "submit",
            (evento) => {

                evento.preventDefault();

                const dados =
                    validarFormulario();

                if (!dados) {
                    return;
                }

                const nova = {

                    id: proximoId++,

                    ...dados

                };

                // O lançamento só existe
                // enquanto a página está aberta.

                transacoes.push(nova);

                limparFiltros();

                atualizarFinanceiro();

                el.modal.close();

                el.formulario.reset();

                limparMensagem();

                abrirDetalhes(nova.id);

            }
        );


        /* ==========================================
           21. DETALHES DA TRANSAÇÃO
        ========================================== */

        function criarDetalhe(
            rotulo,
            valor
        ) {

            const linha = criarElemento(
                "div",
                "finance-detail-row"
            );

            linha.appendChild(
                criarElemento(
                    "span",
                    "",
                    rotulo
                )
            );

            linha.appendChild(
                criarElemento(
                    "strong",
                    "",
                    valor
                )
            );

            return linha;

        }


        function abrirDetalhes(id) {

            const item = transacoes.find(
                transacao => transacao.id === id
            );

            if (!item) {
                return;
            }

            transacaoSelecionada = item.id;

            const informacoes = [

                [
                    "Transação",
                    codigo(item.id)
                ],

                [
                    "Data",
                    formatarData(item.data)
                ],

                [
                    "Referência",
                    item.referencia
                ],

                [
                    "Atendimento",
                    item.servico
                ],

                [
                    "Forma de pagamento",
                    item.metodo
                ],

                [
                    "Valor fictício",
                    moeda(item.valor)
                ],

                [
                    "Situação",
                    item.situacao
                ]

            ];

            const fragmento =
                document.createDocumentFragment();

            informacoes.forEach(
                ([rotulo, valor]) => {

                    fragmento.appendChild(
                        criarDetalhe(
                            rotulo,
                            valor
                        )
                    );

                }
            );

            fragmento.appendChild(
                criarElemento(
                    "p",
                    "",
                    "Transação demonstrativa: " +
                    "nenhum pagamento real foi efetuado."
                )
            );

            el.conteudoDetalhes.replaceChildren(
                fragmento
            );


            /* CONFIGURAR BOTÃO */

            const pendente =
                item.situacao === "Pendente";

            el.confirmarPagamento.disabled =
                !pendente;

            if (pendente) {

                el.confirmarPagamento.textContent =
                    "Marcar como pago";

            } else if (
                item.situacao === "Pago"
            ) {

                el.confirmarPagamento.textContent =
                    "Já pago (simulação)";

            } else {

                el.confirmarPagamento.textContent =
                    "Transação cancelada";

            }

            el.modalDetalhes.showModal();

        }


        /* ==========================================
           22. CLIQUE NO BOTÃO DETALHES
        ========================================== */

        el.tabela.addEventListener(
            "click",
            (evento) => {

                if (
                    !(evento.target instanceof Element)
                ) {
                    return;
                }

                const botao = evento.target.closest(
                    "[data-finance-id]"
                );

                if (!botao) {
                    return;
                }

                const id = Number(
                    botao.dataset.financeId
                );

                if (Number.isInteger(id)) {

                    abrirDetalhes(id);

                }

            }
        );


        /* ==========================================
           23. CONFIRMAR PAGAMENTO SIMULADO
        ========================================== */

        el.confirmarPagamento.addEventListener(
            "click",
            () => {

                const transacao = transacoes.find(
                    item =>
                        item.id === transacaoSelecionada
                );

                if (!transacao) {
                    return;
                }

                if (
                    transacao.situacao !== "Pendente"
                ) {
                    return;
                }

                transacao.situacao = "Pago";

                atualizarFinanceiro();

                el.modalDetalhes.close();

                transacaoSelecionada = null;

            }
        );


        /* ==========================================
           24. FECHAR MODAL DE DETALHES
        ========================================== */

        function fecharDetalhes() {

            el.modalDetalhes.close();

            transacaoSelecionada = null;

        }

        el.fecharDetalhes.addEventListener(
            "click",
            fecharDetalhes
        );

        el.dispensarDetalhes.addEventListener(
            "click",
            fecharDetalhes
        );


        /* ==========================================
           25. CLICAR FORA DOS MODAIS
        ========================================== */

        [
            el.modal,
            el.modalDetalhes
        ].forEach((dialogo) => {

            dialogo.addEventListener(
                "click",
                (evento) => {

                    if (
                        evento.target === dialogo
                    ) {

                        dialogo.close();

                    }

                }
            );

        });


        /* ==========================================
           26. LIMPEZA AO FECHAR
        ========================================== */

        el.modal.addEventListener(
            "close",
            limparMensagem
        );

        el.modalDetalhes.addEventListener(
            "close",
            () => {

                transacaoSelecionada = null;

            }
        );


        /* ==========================================
           27. INICIALIZAÇÃO
        ========================================== */

        atualizarFinanceiro();

        console.log(
            "Financeiro demonstrativo carregado. " +
            "Nenhum pagamento foi processado."
        );

    });

})();
