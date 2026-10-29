
/* =====================================================
   DRA. MAURÍCIA MBANI
   GESTÃO DE SERVIÇOS - DEMONSTRAÇÃO

   ARQUIVO: assets/js/servicos.js

   FUNCIONALIDADES:
   - Listagem de serviços
   - Pesquisa em tempo real
   - Filtros
   - Novo serviço demonstrativo
   - Edição de informações
   - Ocultar e exibir serviços
   - Visualização de detalhes
   - Indicadores dinâmicos

   IMPORTANTE:
   - Sem banco de dados
   - Sem armazenamento permanente
   - Não modifica o site público
===================================================== */

(() => {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {

        /* ==========================================
           1. ELEMENTOS DA INTERFACE
        ========================================== */

        const el = {

            total: document.getElementById(
                "services-total"
            ),

            visiveis: document.getElementById(
                "services-visible"
            ),

            ocultos: document.getElementById(
                "services-hidden"
            ),

            busca: document.getElementById(
                "services-search"
            ),

            filtroModalidade: document.getElementById(
                "services-modality-filter"
            ),

            filtroStatus: document.getElementById(
                "services-status-filter"
            ),

            limparFiltros: document.getElementById(
                "services-clear-filters"
            ),

            contador: document.getElementById(
                "services-results-count"
            ),

            grade: document.getElementById(
                "services-grid"
            ),

            vazio: document.getElementById(
                "services-empty-state"
            ),

            botaoNovo: document.getElementById(
                "services-new-button"
            ),

            modal: document.getElementById(
                "services-modal"
            ),

            tituloModal: document.getElementById(
                "services-modal-title"
            ),

            fecharModal: document.getElementById(
                "services-modal-close"
            ),

            cancelar: document.getElementById(
                "services-form-cancel"
            ),

            formulario: document.getElementById(
                "services-form"
            ),

            campoId: document.getElementById(
                "services-form-id"
            ),

            campoNome: document.getElementById(
                "services-form-name"
            ),

            campoCategoria: document.getElementById(
                "services-form-category"
            ),

            campoDescricao: document.getElementById(
                "services-form-description"
            ),

            campoModalidade: document.getElementById(
                "services-form-modality"
            ),

            campoStatus: document.getElementById(
                "services-form-status"
            ),

            mensagem: document.getElementById(
                "services-form-message"
            ),

            modalDetalhes: document.getElementById(
                "services-details-modal"
            ),

            tituloDetalhes: document.getElementById(
                "services-details-title"
            ),

            conteudoDetalhes: document.getElementById(
                "services-details-content"
            ),

            fecharDetalhes: document.getElementById(
                "services-details-close"
            ),

            dispensarDetalhes: document.getElementById(
                "services-details-dismiss"
            ),

            editarDetalhes: document.getElementById(
                "services-details-edit"
            )

        };


        /* ==========================================
           2. VERIFICAÇÃO DOS ELEMENTOS
        ========================================== */

        const ausentes = Object.entries(el)
            .filter(([, elemento]) => !elemento)
            .map(([nome]) => nome);

        if (ausentes.length > 0) {

            console.warn(
                "Serviços: elementos ausentes:",
                ausentes
            );

            return;
        }


        /* ==========================================
           3. BASE INICIAL DEMONSTRATIVA

           Textos provisórios.
           Não representam aprovação médica.
        ========================================== */

        const servicos = [

            {
                id: 1,

                nome: "Saúde Capilar",

                categoria: "Saúde Capilar",

                descricao:
                    "Informações gerais sobre " +
                    "atendimento relacionado à " +
                    "saúde capilar, com detalhes " +
                    "sujeitos à confirmação da médica.",

                modalidade: "Presencial",

                status: "Visível"
            },

            {
                id: 2,

                nome: "Clínica Geral",

                categoria: "Clínica Geral",

                descricao:
                    "Apresentação demonstrativa do " +
                    "atendimento em clínica geral, " +
                    "com informações a serem revisadas " +
                    "antes da publicação.",

                modalidade: "Presencial",

                status: "Visível"
            },

            {
                id: 3,

                nome: "Consulta Online",

                categoria: "Atendimento Remoto",

                descricao:
                    "Apresentação da modalidade de " +
                    "consulta remota. Critérios, " +
                    "condições e disponibilidade " +
                    "deverão ser confirmados.",

                modalidade: "Online",

                status: "Visível"
            }

        ];


        /* ==========================================
           4. CONFIGURAÇÕES
        ========================================== */

        const categoriasPermitidas = [
            "Saúde Capilar",
            "Clínica Geral",
            "Atendimento Remoto",
            "Outro serviço demonstrativo"
        ];

        const modalidadesPermitidas = [
            "Presencial",
            "Online",
            "Presencial e Online"
        ];

        const statusPermitidos = [
            "Visível",
            "Oculto"
        ];

        let proximoId = 4;

        let servicoSelecionadoId = null;


        /* ==========================================
           5. FUNÇÕES AUXILIARES
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

                // textContent evita que textos
                // editados sejam interpretados
                // como HTML.

                elemento.textContent = String(texto);

            }

            return elemento;
        }


        function normalizarTexto(texto) {

            return String(texto)
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .trim();

        }


        function limparEspacos(texto) {

            return String(texto)
                .replace(/\s+/g, " ")
                .trim();

        }


        function numeroFormatado(numero) {

            return String(numero).padStart(2, "0");

        }


        function obterServico(id) {

            return servicos.find(
                servico => servico.id === id
            );

        }


        /* ==========================================
           6. ESTILOS DE CATEGORIAS
        ========================================== */

        function obterVisual(categoria) {

            if (categoria === "Saúde Capilar") {

                return {
                    classe: "green",
                    icone: "♡"
                };

            }

            if (categoria === "Clínica Geral") {

                return {
                    classe: "copper",
                    icone: "✚"
                };

            }

            if (
                categoria === "Atendimento Remoto"
            ) {

                return {
                    classe: "gold",
                    icone: "◉"
                };

            }

            return {
                classe: "green",
                icone: "✦"
            };

        }


        /* ==========================================
           7. ATUALIZAR INDICADORES
        ========================================== */

        function atualizarIndicadores() {

            const total = servicos.length;

            const visiveis = servicos.filter(
                servico => (
                    servico.status === "Visível"
                )
            ).length;

            const ocultos = servicos.filter(
                servico => (
                    servico.status === "Oculto"
                )
            ).length;

            el.total.textContent =
                numeroFormatado(total);

            el.visiveis.textContent =
                numeroFormatado(visiveis);

            el.ocultos.textContent =
                numeroFormatado(ocultos);

        }


        /* ==========================================
           8. FILTRAR SERVIÇOS
        ========================================== */

        function obterServicosFiltrados() {

            const pesquisa = normalizarTexto(
                el.busca.value
            );

            const modalidade =
                el.filtroModalidade.value;

            const status =
                el.filtroStatus.value;

            return servicos.filter((servico) => {

                const textoServico = normalizarTexto(
                    servico.nome + " " +
                    servico.categoria + " " +
                    servico.descricao
                );

                const correspondeBusca =
                    !pesquisa ||
                    textoServico.includes(pesquisa);


                /* FILTRO DE MODALIDADE

                   A modalidade combinada atende
                   aos filtros Presencial e Online.
                */

                const correspondeModalidade =
                    modalidade === "todas" ||

                    servico.modalidade === modalidade ||

                    servico.modalidade ===
                        "Presencial e Online";


                /* FILTRO DE VISIBILIDADE */

                const correspondeStatus =
                    status === "todos" ||
                    servico.status === status;

                return (
                    correspondeBusca &&
                    correspondeModalidade &&
                    correspondeStatus
                );

            });

        }


        /* ==========================================
           9. CRIAR BOTÕES DOS CARTÕES
        ========================================== */

        function criarBotao(
            texto,
            classe,
            acao,
            id
        ) {

            const botao = criarElemento(
                "button",
                classe,
                texto
            );

            botao.type = "button";

            botao.dataset.action = acao;

            botao.dataset.serviceId = String(id);

            return botao;

        }


        /* ==========================================
           10. CRIAR CAMPO DE INFORMAÇÃO
        ========================================== */

        function criarInformacao(
            rotulo,
            valor
        ) {

            const linha = criarElemento("div");

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


        /* ==========================================
           11. MONTAR CARTÃO DE SERVIÇO
        ========================================== */

        function criarCartao(servico) {

            const oculto =
                servico.status === "Oculto";

            const visual = obterVisual(
                servico.categoria
            );

            const cartao = criarElemento(
                "article",
                "services-card"
            );

            cartao.dataset.serviceId =
                String(servico.id);

            if (oculto) {

                cartao.classList.add(
                    "is-hidden"
                );

            }


            /* TOPO */

            const topo = criarElemento(
                "div",
                "services-card-top"
            );

            const icone = criarElemento(
                "span",
                "services-card-icon " +
                    visual.classe,
                visual.icone
            );

            icone.setAttribute(
                "aria-hidden",
                "true"
            );

            const badge = criarElemento(
                "span",
                "services-status " +
                    (oculto ? "hidden" : "visible"),
                servico.status
            );

            topo.appendChild(icone);

            topo.appendChild(badge);

            cartao.appendChild(topo);


            /* CATEGORIA */

            cartao.appendChild(
                criarElemento(
                    "p",
                    "services-card-category",
                    servico.categoria
                )
            );


            /* NOME */

            cartao.appendChild(
                criarElemento(
                    "h3",
                    "",
                    servico.nome
                )
            );


            /* DESCRIÇÃO */

            cartao.appendChild(
                criarElemento(
                    "p",
                    "services-card-description",
                    servico.descricao
                )
            );


            /* INFORMAÇÕES */

            const informacoes = criarElemento(
                "div",
                "services-card-details"
            );

            informacoes.appendChild(
                criarInformacao(
                    "Modalidade ilustrativa",
                    servico.modalidade
                )
            );

            informacoes.appendChild(
                criarInformacao(
                    "Valor da consulta",
                    "A definir"
                )
            );

            cartao.appendChild(informacoes);


            /* BOTÕES */

            const acoes = criarElemento(
                "div",
                "services-card-actions"
            );

            acoes.appendChild(
                criarBotao(
                    "Editar",
                    "services-edit-button",
                    "edit",
                    servico.id
                )
            );

            acoes.appendChild(
                criarBotao(
                    "Detalhes",
                    "services-details-button",
                    "details",
                    servico.id
                )
            );

            const botaoVisibilidade =
                criarBotao(
                    oculto ? "Exibir" : "Ocultar",
                    "services-visibility-button",
                    "visibility",
                    servico.id
                );

            botaoVisibilidade.setAttribute(
                "aria-label",
                (
                    oculto ? "Exibir " : "Ocultar "
                ) + servico.nome +
                " na demonstração"
            );

            acoes.appendChild(
                botaoVisibilidade
            );

            cartao.appendChild(acoes);

            return cartao;

        }


        /* ==========================================
           12. ATUALIZAR GRADE
        ========================================== */

        function renderizarServicos() {

            const filtrados =
                obterServicosFiltrados();

            const fragmento =
                document.createDocumentFragment();

            filtrados.forEach((servico) => {

                fragmento.appendChild(
                    criarCartao(servico)
                );

            });

            // Substitui os cartões estáticos
            // pelos cartões interativos.

            el.grade.replaceChildren(fragmento);


            /* CONTADOR */

            el.contador.textContent =
                filtrados.length +
                (
                    filtrados.length === 1
                        ? " serviço"
                        : " serviços"
                );


            /* ESTADO VAZIO */

            el.vazio.hidden =
                filtrados.length !== 0;

        }


        /* ==========================================
           13. ATUALIZAÇÃO GERAL
        ========================================== */

        function atualizarPagina() {

            atualizarIndicadores();

            renderizarServicos();

        }


        /* ==========================================
           14. PESQUISA E FILTROS
        ========================================== */

        el.busca.addEventListener(
            "input",
            renderizarServicos
        );

        el.filtroModalidade.addEventListener(
            "change",
            renderizarServicos
        );

        el.filtroStatus.addEventListener(
            "change",
            renderizarServicos
        );


        /* ==========================================
           15. LIMPAR FILTROS
        ========================================== */

        function limparFiltros() {

            el.busca.value = "";

            el.filtroModalidade.value =
                "todas";

            el.filtroStatus.value =
                "todos";

            renderizarServicos();

        }

        el.limparFiltros.addEventListener(
            "click",
            limparFiltros
        );


        /* ==========================================
           16. MENSAGENS DO FORMULÁRIO
        ========================================== */

        function mostrarMensagem(
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
           17. ABRIR NOVO SERVIÇO
        ========================================== */

        function abrirNovoServico() {

            el.formulario.reset();

            limparMensagem();

            el.campoId.value = "";

            el.campoStatus.value =
                "Visível";

            el.tituloModal.textContent =
                "Novo serviço demonstrativo";

            el.modal.showModal();

            el.campoNome.focus();

        }

        el.botaoNovo.addEventListener(
            "click",
            abrirNovoServico
        );


        /* ==========================================
           18. ABRIR EDIÇÃO
        ========================================== */

        function abrirEdicao(id) {

            const servico = obterServico(id);

            if (!servico) {
                return;
            }

            el.formulario.reset();

            limparMensagem();

            el.campoId.value =
                String(servico.id);

            el.campoNome.value =
                servico.nome;

            el.campoCategoria.value =
                servico.categoria;

            el.campoDescricao.value =
                servico.descricao;

            el.campoModalidade.value =
                servico.modalidade;

            el.campoStatus.value =
                servico.status;

            el.tituloModal.textContent =
                "Editar serviço";

            el.modal.showModal();

            el.campoNome.focus();

        }


        /* ==========================================
           19. FECHAR FORMULÁRIO
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
           20. VALIDAR FORMULÁRIO
        ========================================== */

        function validarFormulario() {

            if (!el.formulario.checkValidity()) {

                el.formulario.reportValidity();

                return null;

            }

            const dados = {

                nome: limparEspacos(
                    el.campoNome.value
                ),

                categoria:
                    el.campoCategoria.value,

                descricao: String(
                    el.campoDescricao.value
                ).trim(),

                modalidade:
                    el.campoModalidade.value,

                status:
                    el.campoStatus.value

            };


            /* TEXTOS OBRIGATÓRIOS */

            if (
                !dados.nome ||
                !dados.descricao
            ) {

                mostrarMensagem(
                    "Informe um nome e uma " +
                    "descrição demonstrativos.",
                    true
                );

                return null;

            }


            /* TAMANHOS PERMITIDOS */

            if (
                dados.nome.length > 70 ||
                dados.descricao.length > 350
            ) {

                mostrarMensagem(
                    "O nome ou a descrição " +
                    "ultrapassou o limite de caracteres.",
                    true
                );

                return null;

            }


            /* OPÇÕES DISPONÍVEIS */

            if (
                !categoriasPermitidas.includes(
                    dados.categoria
                ) ||

                !modalidadesPermitidas.includes(
                    dados.modalidade
                ) ||

                !statusPermitidos.includes(
                    dados.status
                )
            ) {

                mostrarMensagem(
                    "Selecione apenas as opções " +
                    "disponíveis no protótipo.",
                    true
                );

                return null;

            }


            /* EVITAR NOMES DUPLICADOS */

            const idEdicao = Number(
                el.campoId.value
            );

            const nomeDuplicado = servicos.some(
                servico => {

                    return (
                        normalizarTexto(servico.nome) ===
                        normalizarTexto(dados.nome) &&

                        servico.id !== idEdicao
                    );

                }
            );

            if (nomeDuplicado) {

                mostrarMensagem(
                    "Já existe um serviço com " +
                    "esse nome na demonstração.",
                    true
                );

                return null;

            }

            return dados;

        }


        /* ==========================================
           21. SALVAR NOVO SERVIÇO OU EDIÇÃO
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


                /* IDENTIFICAR SE É EDIÇÃO */

                const idTexto =
                    el.campoId.value;

                let idSalvo;


                if (idTexto !== "") {

                    const id = Number(idTexto);

                    const servico =
                        obterServico(id);

                    if (!servico) {

                        mostrarMensagem(
                            "Serviço não encontrado.",
                            true
                        );

                        return;
                    }

                    Object.assign(
                        servico,
                        dados
                    );

                    idSalvo = id;

                } else {

                    /* NOVO REGISTRO */

                    const novoServico = {

                        id: proximoId++,

                        ...dados

                    };

                    servicos.push(
                        novoServico
                    );

                    idSalvo = novoServico.id;

                }


                /* MOSTRAR RESULTADO */

                limparFiltros();

                atualizarPagina();

                el.modal.close();

                el.formulario.reset();

                limparMensagem();


                /* ABRIR DETALHES PARA CONFERÊNCIA */

                abrirDetalhes(idSalvo);

            }
        );


        /* ==========================================
           22. ALTERAR VISIBILIDADE
        ========================================== */

        function alternarVisibilidade(id) {

            const servico = obterServico(id);

            if (!servico) {
                return;
            }

            servico.status =
                servico.status === "Visível"
                    ? "Oculto"
                    : "Visível";

            atualizarPagina();

            // A alteração ocorre somente
            // na listagem administrativa.
            // O site público permanece igual.

        }


        /* ==========================================
           23. CRIAR LINHA DE DETALHES
        ========================================== */

        function criarLinhaDetalhe(
            rotulo,
            valor
        ) {

            const linha = criarElemento(
                "div",
                "services-detail-row"
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


        /* ==========================================
           24. ABRIR DETALHES DO SERVIÇO
        ========================================== */

        function abrirDetalhes(id) {

            const servico = obterServico(id);

            if (!servico) {
                return;
            }

            servicoSelecionadoId = id;

            el.tituloDetalhes.textContent =
                servico.nome;

            const informacoes = [

                [
                    "Serviço",
                    servico.nome
                ],

                [
                    "Categoria",
                    servico.categoria
                ],

                [
                    "Modalidade",
                    servico.modalidade
                ],

                [
                    "Visibilidade",
                    servico.status
                ],

                [
                    "Valor",
                    "A definir"
                ]

            ];

            const fragmento =
                document.createDocumentFragment();

            informacoes.forEach(
                ([rotulo, valor]) => {

                    fragmento.appendChild(
                        criarLinhaDetalhe(
                            rotulo,
                            valor
                        )
                    );

                }
            );


            /* DESCRIÇÃO COMPLETA */

            fragmento.appendChild(
                criarElemento(
                    "p",
                    "",
                    "Descrição demonstrativa:"
                )
            );

            fragmento.appendChild(
                criarElemento(
                    "p",
                    "",
                    servico.descricao
                )
            );


            /* AVISO */

            const aviso = criarElemento(
                "p",
                "",
                "Informações sujeitas à aprovação " +
                "da Dra. Maurícia Mbani."
            );

            aviso.style.color = "#B76E4F";

            aviso.style.fontWeight = "600";

            fragmento.appendChild(aviso);

            el.conteudoDetalhes.replaceChildren(
                fragmento
            );

            el.modalDetalhes.showModal();

        }


        /* ==========================================
           25. CLIQUES NOS CARTÕES

           Event delegation:
           funciona também com serviços novos.
        ========================================== */

        el.grade.addEventListener(
            "click",
            (evento) => {

                if (
                    !(evento.target instanceof Element)
                ) {
                    return;
                }

                const botao = evento.target.closest(
                    "[data-action][data-service-id]"
                );

                if (!botao) {
                    return;
                }

                const id = Number(
                    botao.dataset.serviceId
                );

                const acao =
                    botao.dataset.action;

                if (!Number.isInteger(id)) {
                    return;
                }


                /* EDITAR */

                if (acao === "edit") {

                    abrirEdicao(id);

                    return;
                }


                /* DETALHES */

                if (acao === "details") {

                    abrirDetalhes(id);

                    return;
                }


                /* OCULTAR / EXIBIR */

                if (acao === "visibility") {

                    alternarVisibilidade(id);

                }

            }
        );


        /* ==========================================
           26. EDITAR PELO MODAL DE DETALHES
        ========================================== */

        el.editarDetalhes.addEventListener(
            "click",
            () => {

                const id =
                    servicoSelecionadoId;

                if (id === null) {
                    return;
                }

                el.modalDetalhes.close();

                servicoSelecionadoId = null;

                abrirEdicao(id);

            }
        );


        /* ==========================================
           27. FECHAR DETALHES
        ========================================== */

        function fecharDetalhes() {

            el.modalDetalhes.close();

            servicoSelecionadoId = null;

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
           28. FECHAR AO CLICAR FORA
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
           29. LIMPEZA DOS MODAIS
        ========================================== */

        el.modal.addEventListener(
            "close",
            limparMensagem
        );

        el.modalDetalhes.addEventListener(
            "close",
            () => {

                servicoSelecionadoId = null;

            }
        );


        /* ==========================================
           30. INICIALIZAÇÃO
        ========================================== */

        atualizarPagina();

        console.log(
            "Serviços demonstrativos carregados. " +
            "Nenhuma alteração foi publicada."
        );

    });

})();
