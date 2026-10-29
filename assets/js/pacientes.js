
/* =====================================================
   DRA. MAURÍCIA MBANI
   GESTÃO DE PACIENTES - DEMONSTRAÇÃO

   ARQUIVO: assets/js/pacientes.js

   FUNCIONALIDADES:
   - Listagem de pacientes fictícios
   - Busca em tempo real
   - Filtros por serviço e situação
   - Indicadores automáticos
   - Cadastro demonstrativo
   - Visualização de detalhes
   - Validações
   - Sem banco de dados
   - Sem armazenamento permanente
===================================================== */

(() => {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {

        /* ==========================================
           1. ELEMENTOS DO HTML
        ========================================== */

        const elementos = {

            total: document.getElementById(
                "patients-total"
            ),

            acompanhamento: document.getElementById(
                "patients-followup"
            ),

            novos: document.getElementById(
                "patients-new"
            ),

            busca: document.getElementById(
                "patients-search"
            ),

            filtroServico: document.getElementById(
                "patients-service-filter"
            ),

            filtroSituacao: document.getElementById(
                "patients-status-filter"
            ),

            limparFiltros: document.getElementById(
                "patients-clear-filters"
            ),

            tabela: document.getElementById(
                "patients-table-body"
            ),

            contador: document.getElementById(
                "patients-results-count"
            ),

            vazio: document.getElementById(
                "patients-empty-state"
            ),

            botaoNovo: document.getElementById(
                "patients-new-button"
            ),

            modal: document.getElementById(
                "patients-modal"
            ),

            fecharModal: document.getElementById(
                "patients-modal-close"
            ),

            cancelar: document.getElementById(
                "patients-form-cancel"
            ),

            formulario: document.getElementById(
                "patients-form"
            ),

            campoPaciente: document.getElementById(
                "patients-form-name"
            ),

            campoServico: document.getElementById(
                "patients-form-service"
            ),

            campoModalidade: document.getElementById(
                "patients-form-modality"
            ),

            campoSituacao: document.getElementById(
                "patients-form-status"
            ),

            mensagem: document.getElementById(
                "patients-form-message"
            ),

            modalDetalhes: document.getElementById(
                "patients-details-modal"
            ),

            conteudoDetalhes: document.getElementById(
                "patients-details-content"
            ),

            fecharDetalhes: document.getElementById(
                "patients-details-close"
            ),

            dispensarDetalhes: document.getElementById(
                "patients-details-dismiss"
            )

        };


        /* ==========================================
           2. CONFERIR ELEMENTOS
        ========================================== */

        const ausentes = Object.entries(elementos)
            .filter(([, elemento]) => !elemento)
            .map(([nome]) => nome);

        if (ausentes.length > 0) {

            console.warn(
                "Pacientes: elementos ausentes:",
                ausentes
            );

            return;
        }


        /* ==========================================
           3. BASE DE PACIENTES FICTÍCIOS

           Não utilizar nomes, documentos,
           telefones ou históricos reais.
        ========================================== */

        const pacientes = [

            {
                id: 1,
                nome: "Paciente Exemplo 01",
                servico: "Saúde Capilar",
                modalidade: "Presencial",
                situacao: "Acompanhamento",
                ultimaInteracao: "Consulta fictícia"
            },

            {
                id: 2,
                nome: "Paciente Exemplo 02",
                servico: "Clínica Geral",
                modalidade: "Presencial",
                situacao: "Novo",
                ultimaInteracao: "Cadastro fictício"
            },

            {
                id: 3,
                nome: "Paciente Exemplo 03",
                servico: "Consulta Online",
                modalidade: "Online",
                situacao: "Acompanhamento",
                ultimaInteracao: "Consulta fictícia"
            },

            {
                id: 4,
                nome: "Paciente Exemplo 04",
                servico: "Saúde Capilar",
                modalidade: "Presencial",
                situacao: "Acompanhamento",
                ultimaInteracao: "Retorno fictício"
            },

            {
                id: 5,
                nome: "Paciente Exemplo 05",
                servico: "Clínica Geral",
                modalidade: "Presencial",
                situacao: "Novo",
                ultimaInteracao: "Cadastro fictício"
            },

            {
                id: 6,
                nome: "Paciente Exemplo 06",
                servico: "Saúde Capilar",
                modalidade: "Presencial",
                situacao: "Acompanhamento",
                ultimaInteracao: "Consulta fictícia"
            },

            {
                id: 7,
                nome: "Paciente Exemplo 07",
                servico: "Consulta Online",
                modalidade: "Online",
                situacao: "Novo",
                ultimaInteracao: "Cadastro fictício"
            },

            {
                id: 8,
                nome: "Paciente Exemplo 08",
                servico: "Saúde Capilar",
                modalidade: "Presencial",
                situacao: "Acompanhamento",
                ultimaInteracao: "Retorno fictício"
            }

        ];


        /* ==========================================
           4. CONFIGURAÇÕES
        ========================================== */

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
            "Novo",
            "Acompanhamento"
        ];

        const nomesPermitidos = [
            "Paciente Exemplo 09",
            "Paciente Exemplo 10",
            "Paciente Exemplo 11",
            "Paciente Exemplo 12"
        ];


        /* ==========================================
           5. FUNÇÕES AUXILIARES
        ========================================== */

        function criarElemento(
            tag,
            classe = "",
            texto = ""
        ) {

            const elemento = document.createElement(
                tag
            );

            if (classe) {
                elemento.className = classe;
            }

            // textContent evita interpretar
            // valores como código HTML.

            elemento.textContent = String(texto);

            return elemento;
        }


        function identificador(id) {

            return (
                "DEMO-" +
                String(id).padStart(3, "0")
            );

        }


        function numeroFormatado(numero) {

            return String(numero).padStart(
                2,
                "0"
            );

        }


        function classeSituacao(situacao) {

            return situacao === "Acompanhamento"
                ? "followup"
                : "new";

        }


        function normalizarTexto(texto) {

            return String(texto)
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .trim();

        }


        /* ==========================================
           6. INDICADORES DINÂMICOS
        ========================================== */

        function atualizarIndicadores() {

            const total = pacientes.length;

            const acompanhamento = pacientes.filter(
                paciente => (
                    paciente.situacao ===
                    "Acompanhamento"
                )
            ).length;

            const novos = pacientes.filter(
                paciente => (
                    paciente.situacao === "Novo"
                )
            ).length;

            elementos.total.textContent =
                numeroFormatado(total);

            elementos.acompanhamento.textContent =
                numeroFormatado(acompanhamento);

            elementos.novos.textContent =
                numeroFormatado(novos);

        }


        /* ==========================================
           7. FILTRAR PACIENTES
        ========================================== */

        function obterPacientesFiltrados() {

            const pesquisa = normalizarTexto(
                elementos.busca.value
            );

            const servico =
                elementos.filtroServico.value;

            const situacao =
                elementos.filtroSituacao.value;

            return pacientes.filter((paciente) => {

                const nome = normalizarTexto(
                    paciente.nome
                );

                const codigo = normalizarTexto(
                    identificador(paciente.id)
                );

                const correspondePesquisa =
                    !pesquisa ||
                    nome.includes(pesquisa) ||
                    codigo.includes(pesquisa);

                const correspondeServico =
                    servico === "todos" ||
                    paciente.servico === servico;

                const correspondeSituacao =
                    situacao === "todos" ||
                    paciente.situacao === situacao;

                return (
                    correspondePesquisa &&
                    correspondeServico &&
                    correspondeSituacao
                );

            });

        }


        /* ==========================================
           8. CRIAR CÉLULA DE TEXTO
        ========================================== */

        function criarCelula(texto) {

            return criarElemento(
                "td",
                "",
                texto
            );

        }


        /* ==========================================
           9. CRIAR LINHA DE PACIENTE
        ========================================== */

        function criarLinhaPaciente(paciente) {

            const linha = document.createElement(
                "tr"
            );


            /* IDENTIFICADOR */

            const colunaNome = document.createElement(
                "td"
            );

            const blocoNome = criarElemento(
                "div",
                "patients-name-cell"
            );

            const avatar = criarElemento(
                "span",
                "patients-avatar",
                numeroFormatado(paciente.id)
            );

            const dadosNome = document.createElement(
                "div"
            );

            const nome = criarElemento(
                "strong",
                "",
                paciente.nome
            );

            const codigo = criarElemento(
                "small",
                "",
                "ID " + identificador(paciente.id)
            );

            dadosNome.appendChild(nome);
            dadosNome.appendChild(codigo);

            blocoNome.appendChild(avatar);
            blocoNome.appendChild(dadosNome);

            colunaNome.appendChild(blocoNome);

            linha.appendChild(colunaNome);


            /* ATENDIMENTO */

            linha.appendChild(
                criarCelula(paciente.servico)
            );


            /* MODALIDADE */

            linha.appendChild(
                criarCelula(paciente.modalidade)
            );


            /* ÚLTIMA INTERAÇÃO */

            linha.appendChild(
                criarCelula(
                    paciente.ultimaInteracao
                )
            );


            /* SITUAÇÃO */

            const colunaSituacao =
                document.createElement("td");

            const situacao = criarElemento(
                "span",
                "patients-status " +
                    classeSituacao(paciente.situacao),
                paciente.situacao
            );

            colunaSituacao.appendChild(situacao);

            linha.appendChild(colunaSituacao);


            /* AÇÕES */

            const colunaAcoes =
                document.createElement("td");

            const botao = criarElemento(
                "button",
                "patients-detail-btn",
                "Detalhes"
            );

            botao.type = "button";

            botao.dataset.patientId =
                String(paciente.id);

            botao.setAttribute(
                "aria-label",
                "Ver detalhes de " +
                paciente.nome
            );

            colunaAcoes.appendChild(botao);

            linha.appendChild(colunaAcoes);

            return linha;

        }


        /* ==========================================
           10. RENDERIZAR TABELA
        ========================================== */

        function renderizarTabela() {

            const registros =
                obterPacientesFiltrados();

            // Limpa as linhas de exemplo do HTML.

            elementos.tabela.replaceChildren();

            const fragmento =
                document.createDocumentFragment();

            registros.forEach((paciente) => {

                fragmento.appendChild(
                    criarLinhaPaciente(paciente)
                );

            });

            elementos.tabela.appendChild(fragmento);


            /* CONTADOR */

            elementos.contador.textContent =
                registros.length +
                (
                    registros.length === 1
                        ? " registro fictício"
                        : " registros fictícios"
                );


            /* SEM RESULTADOS */

            elementos.vazio.hidden =
                registros.length !== 0;

        }


        /* ==========================================
           11. ATUALIZAR MÓDULO
        ========================================== */

        function atualizarPagina() {

            atualizarIndicadores();

            renderizarTabela();

        }


        /* ==========================================
           12. PESQUISA EM TEMPO REAL
        ========================================== */

        elementos.busca.addEventListener(
            "input",
            renderizarTabela
        );


        /* ==========================================
           13. FILTROS
        ========================================== */

        elementos.filtroServico.addEventListener(
            "change",
            renderizarTabela
        );

        elementos.filtroSituacao.addEventListener(
            "change",
            renderizarTabela
        );


        /* ==========================================
           14. LIMPAR FILTROS
        ========================================== */

        function limparFiltros() {

            elementos.busca.value = "";

            elementos.filtroServico.value = "todos";

            elementos.filtroSituacao.value = "todos";

            renderizarTabela();

        }

        elementos.limparFiltros.addEventListener(
            "click",
            limparFiltros
        );


        /* ==========================================
           15. MENSAGENS DO FORMULÁRIO
        ========================================== */

        function mostrarMensagem(
            texto,
            erro = false
        ) {

            elementos.mensagem.textContent = texto;

            elementos.mensagem.hidden = false;

            elementos.mensagem.classList.remove(
                "is-error",
                "is-success"
            );

            elementos.mensagem.classList.add(
                erro ? "is-error" : "is-success"
            );

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
           16. ABRIR CADASTRO DEMONSTRATIVO
        ========================================== */

        function abrirCadastro() {

            elementos.formulario.reset();

            limparMensagem();

            // Não apresenta identificadores
            // que já foram cadastrados.

            const opcoes =
                elementos.campoPaciente.options;

            for (const opcao of opcoes) {

                if (!opcao.value) {
                    continue;
                }

                opcao.disabled = pacientes.some(
                    paciente => (
                        paciente.nome === opcao.value
                    )
                );

            }

            elementos.modal.showModal();

            elementos.campoPaciente.focus();

        }

        elementos.botaoNovo.addEventListener(
            "click",
            abrirCadastro
        );


        /* ==========================================
           17. FECHAR CADASTRO
        ========================================== */

        function fecharCadastro() {

            elementos.modal.close();

            limparMensagem();

        }

        elementos.fecharModal.addEventListener(
            "click",
            fecharCadastro
        );

        elementos.cancelar.addEventListener(
            "click",
            fecharCadastro
        );


        /* ==========================================
           18. VALIDAR NOVO CADASTRO
        ========================================== */

        function validarCadastro() {

            if (!elementos.formulario.checkValidity()) {

                elementos.formulario.reportValidity();

                return null;
            }

            const nome =
                elementos.campoPaciente.value;

            const servico =
                elementos.campoServico.value;

            const modalidade =
                elementos.campoModalidade.value;

            const situacao =
                elementos.campoSituacao.value;


            /* OPÇÕES FICTÍCIAS */

            if (
                !nomesPermitidos.includes(nome) ||
                !servicosPermitidos.includes(servico) ||
                !modalidadesPermitidas.includes(modalidade) ||
                !situacoesPermitidas.includes(situacao)
            ) {

                mostrarMensagem(
                    "Selecione apenas as opções " +
                    "demonstrativas disponíveis.",
                    true
                );

                return null;
            }


            /* EVITAR CADASTRO REPETIDO */

            const jaExiste = pacientes.some(
                paciente => paciente.nome === nome
            );

            if (jaExiste) {

                mostrarMensagem(
                    "Esse identificador fictício " +
                    "já está cadastrado.",
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

            return {
                nome,
                servico,
                modalidade,
                situacao
            };

        }


        /* ==========================================
           19. SALVAR PACIENTE FICTÍCIO
        ========================================== */

        elementos.formulario.addEventListener(
            "submit",
            (evento) => {

                evento.preventDefault();

                const dados = validarCadastro();

                if (!dados) {
                    return;
                }


                /* IDENTIFICADOR AUTOMÁTICO */

                const numero = Number(
                    dados.nome.match(/\d+$/)?.[0]
                );

                if (
                    !Number.isInteger(numero) ||
                    numero < 9 ||
                    numero > 12
                ) {

                    mostrarMensagem(
                        "Identificador inválido.",
                        true
                    );

                    return;
                }


                /* CRIAR REGISTRO */

                const novoPaciente = {

                    id: numero,

                    nome: dados.nome,

                    servico: dados.servico,

                    modalidade: dados.modalidade,

                    situacao: dados.situacao,

                    ultimaInteracao:
                        "Cadastro demonstrativo"

                };


                /* ADICIONAR À MEMÓRIA */

                pacientes.push(novoPaciente);


                /* ATUALIZAR INTERFACE */

                limparFiltros();

                atualizarPagina();

                elementos.modal.close();

                elementos.formulario.reset();

                limparMensagem();


                /* ABRIR DETALHES AUTOMATICAMENTE */

                abrirDetalhes(novoPaciente.id);

            }
        );


        /* ==========================================
           20. CRIAR LINHA DE DETALHES
        ========================================== */

        function criarLinhaDetalhe(rotulo, valor) {

            const linha = criarElemento(
                "div",
                "patients-detail-row"
            );

            const titulo = criarElemento(
                "span",
                "",
                rotulo
            );

            const conteudo = criarElemento(
                "strong",
                "",
                valor
            );

            linha.appendChild(titulo);

            linha.appendChild(conteudo);

            return linha;

        }


        /* ==========================================
           21. ABRIR DETALHES DO PACIENTE
        ========================================== */

        function abrirDetalhes(id) {

            const paciente = pacientes.find(
                item => item.id === id
            );

            if (!paciente) {
                return;
            }

            elementos.conteudoDetalhes.replaceChildren();


            const informacoes = [

                [
                    "Identificador",
                    identificador(paciente.id)
                ],

                [
                    "Paciente",
                    paciente.nome
                ],

                [
                    "Atendimento",
                    paciente.servico
                ],

                [
                    "Modalidade",
                    paciente.modalidade
                ],

                [
                    "Situação",
                    paciente.situacao
                ],

                [
                    "Última interação",
                    paciente.ultimaInteracao
                ]

            ];


            informacoes.forEach(([rotulo, valor]) => {

                elementos.conteudoDetalhes.appendChild(
                    criarLinhaDetalhe(
                        rotulo,
                        valor
                    )
                );

            });


            /* AVISO DE DEMONSTRAÇÃO */

            const aviso = criarElemento(
                "p",
                "",
                "Registro de demonstração. " +
                "Não contém prontuário ou " +
                "informações pessoais reais."
            );

            aviso.style.marginTop = "10px";

            aviso.style.fontSize = "0.76rem";

            aviso.style.color = "#B76E4F";

            elementos.conteudoDetalhes.appendChild(
                aviso
            );


            elementos.modalDetalhes.showModal();

        }


        /* ==========================================
           22. CLIQUE EM DETALHES NA TABELA
        ========================================== */

        elementos.tabela.addEventListener(
            "click",
            (evento) => {

                if (!(evento.target instanceof Element)) {
                    return;
                }

                const botao = evento.target.closest(
                    "[data-patient-id]"
                );

                if (!botao) {
                    return;
                }

                const id = Number(
                    botao.dataset.patientId
                );

                if (Number.isInteger(id)) {
                    abrirDetalhes(id);
                }

            }
        );


        /* ==========================================
           23. FECHAR DETALHES
        ========================================== */

        function fecharJanelaDetalhes() {

            elementos.modalDetalhes.close();

        }

        elementos.fecharDetalhes.addEventListener(
            "click",
            fecharJanelaDetalhes
        );

        elementos.dispensarDetalhes.addEventListener(
            "click",
            fecharJanelaDetalhes
        );


        /* ==========================================
           24. FECHAR AO CLICAR FORA DO MODAL
        ========================================== */

        [
            elementos.modal,
            elementos.modalDetalhes
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
           25. LIMPAR MENSAGENS AO FECHAR
        ========================================== */

        elementos.modal.addEventListener(
            "close",
            limparMensagem
        );


        /* ==========================================
           26. INICIALIZAÇÃO
        ========================================== */

        atualizarPagina();

        console.log(
            "Gestão de pacientes inicializada. " +
            "Base fictícia carregada em memória."
        );

    });

})();
