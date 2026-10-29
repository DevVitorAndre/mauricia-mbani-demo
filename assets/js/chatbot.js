
/* =====================================================
   DRA. MAURÍCIA MBANI
   ASSISTENTE VIRTUAL - PÁGINA COMPLETA

   ARQUIVO: assets/js/chatbot.js

   FUNCIONALIDADES:
   - Respostas automáticas
   - Perguntas sugeridas
   - Envio pelo botão ou Enter
   - Links para páginas do site
   - Reiniciar conversa
   - Proteção básica contra dados pessoais
   - Sem API, servidor ou armazenamento
===================================================== */

(() => {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {

        /* ==========================================
           1. ELEMENTOS DO HTML
        ========================================== */

        const formulario = document.getElementById(
            "assistant-form"
        );

        const campo = document.getElementById(
            "assistant-input"
        );

        const mensagens = document.getElementById(
            "assistant-messages"
        );

        const botaoEnviar = document.getElementById(
            "assistant-send"
        );

        const botaoLimpar = document.getElementById(
            "assistant-clear"
        );

        const sugestoes = document.querySelectorAll(
            ".assistant-suggestion"
        );

        // Se não estivermos na página do assistente,
        // não inicializa o chat completo.

        if (
            !formulario ||
            !campo ||
            !mensagens ||
            !botaoEnviar ||
            !botaoLimpar
        ) {
            return;
        }


        /* ==========================================
           2. CONFIGURAÇÕES
        ========================================== */

        const TAMANHO_MAXIMO = 250;

        // Preserva a mensagem original do HTML
        // para restaurá-la ao reiniciar.

        const mensagemInicial = mensagens.cloneNode(true);


        /* ==========================================
           3. NORMALIZAÇÃO DAS PERGUNTAS
        ========================================== */

        function normalizarTexto(texto) {

            return texto
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/\s+/g, " ")
                .trim();
        }


        /* ==========================================
           4. DETECÇÃO BÁSICA DE DADOS PESSOAIS

           Evita reproduzir no chat certos dados
           pessoais digitados pelo visitante.
        ========================================== */

        function contemDadosPessoais(texto) {

            const email =
                /[^\s@]+@[^\s@]+\.[^\s@]+/;

            const telefone =
                /(?:\+?55\s*)?\(?\d{2}\)?[\s.-]*9?\d{4}[\s.-]*\d{4}/;

            const documento =
                /\b\d{3}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d{2}\b/;

            return (
                email.test(texto) ||
                telefone.test(texto) ||
                documento.test(texto)
            );
        }


        /* ==========================================
           5. IDENTIFICAR PERGUNTAS SOBRE SAÚDE
        ========================================== */

        function perguntaMedicaIndividual(texto) {

            return (
                /\b(estou sentindo|minha dor|meu exame|meus exames|meu resultado|minha receita|meu diagnostico|tenho sintomas|estou doente|qual remedio|que remedio|qual medicamento|posso tomar|devo tomar|qual dose)\b/.test(texto) ||
                /\b(diagnosticar|prescrever|interpretar exame)\b/.test(texto)
            );
        }


        /* ==========================================
           6. BASE DE RESPOSTAS AUTOMÁTICAS
        ========================================== */

        function encontrarResposta(pergunta) {

            const texto = normalizarTexto(pergunta);


            /* --------------------------------------
               SITUAÇÕES DE URGÊNCIA
            -------------------------------------- */

            if (
                /\b(emergencia|urgencia|dor no peito|falta de ar|desmaio|desmaiando|convulsao)\b/.test(texto)
            ) {

                return {
                    resposta:
                        "Este assistente não oferece atendimento de emergência.\n\n" +
                        "Se você apresenta dor no peito, dificuldade importante para respirar, " +
                        "desmaio ou outro sintoma grave, procure atendimento médico imediato.\n\n" +
                        "Não utilize este chat para situações urgentes.",
                    link: null
                };
            }


            /* --------------------------------------
               PERGUNTAS MÉDICAS INDIVIDUAIS
            -------------------------------------- */

            if (perguntaMedicaIndividual(texto)) {

                return {
                    resposta:
                        "Posso ajudar com informações gerais sobre o site, mas não consigo " +
                        "avaliar sintomas, interpretar exames, indicar medicamentos ou " +
                        "realizar diagnósticos.\n\n" +
                        "Para uma avaliação individual, procure atendimento médico.",
                    link: {
                        pagina: "agendamento.html",
                        texto: "Conhecer agendamento demonstrativo"
                    }
                };
            }


            /* --------------------------------------
               PAGAMENTOS
            -------------------------------------- */

            if (
                /\b(pagamento|pagar|pix|cartao|credito|debito|preco|valor|custa|quanto custa|cobranca)\b/.test(texto)
            ) {

                return {
                    resposta:
                        "Nesta versão demonstrativa, o pagamento é totalmente fictício.\n\n" +
                        "O valor exibido durante a simulação é apenas ilustrativo " +
                        "e não representa o preço real das consultas.\n\n" +
                        "Nenhum Pix, cartão ou cobrança é processado.",
                    link: {
                        pagina: "agendamento.html",
                        texto: "Experimentar agendamento"
                    }
                };
            }


            /* --------------------------------------
               SAÚDE CAPILAR
            -------------------------------------- */

            if (
                /\b(capilar|cabelo|cabelos|queda de cabelo|couro cabeludo|tricologia|alopecia)\b/.test(texto)
            ) {

                return {
                    resposta:
                        "A página de Saúde Capilar apresenta informações sobre " +
                        "avaliação médica de queixas relacionadas aos cabelos " +
                        "e ao couro cabeludo.\n\n" +
                        "Entre os assuntos abordados estão queda de cabelo, " +
                        "afinamento dos fios e alterações do couro cabeludo.\n\n" +
                        "A identificação das causas depende de avaliação médica.",
                    link: {
                        pagina: "saude-capilar.html",
                        texto: "Conhecer Saúde Capilar"
                    }
                };
            }


            /* --------------------------------------
               CLÍNICA GERAL
            -------------------------------------- */

            if (
                /\b(clinica geral|clinico geral|medico geral|avaliacao clinica)\b/.test(texto)
            ) {

                return {
                    resposta:
                        "A página de Clínica Geral apresenta uma proposta de " +
                        "atendimento médico individualizado.\n\n" +
                        "Ela aborda avaliação de sintomas, orientações preventivas, " +
                        "análise de exames no contexto clínico e acompanhamento " +
                        "conforme as necessidades de cada paciente.",
                    link: {
                        pagina: "clinica-geral.html",
                        texto: "Conhecer Clínica Geral"
                    }
                };
            }


            /* --------------------------------------
               CONSULTA ONLINE
            -------------------------------------- */

            if (
                /\b(online|teleconsulta|videochamada|video chamada|consulta a distancia|atendimento remoto)\b/.test(texto)
            ) {

                return {
                    resposta:
                        "A consulta online é uma modalidade de atendimento médico " +
                        "realizada à distância por videochamada, quando adequada " +
                        "à necessidade clínica.\n\n" +
                        "Na página de Consulta Online, você encontra orientações " +
                        "sobre preparação, funcionamento e limitações dessa modalidade.\n\n" +
                        "O protótipo não realiza videochamadas reais.",
                    link: {
                        pagina: "consulta-online.html",
                        texto: "Conhecer Consulta Online"
                    }
                };
            }


            /* --------------------------------------
               AGENDAMENTO
            -------------------------------------- */

            if (
                /\b(agenda|agendamento|agendar|marcar|reservar|horario|horarios|disponibilidade)\b/.test(texto)
            ) {

                return {
                    resposta:
                        "Nosso sistema permite experimentar um agendamento demonstrativo.\n\n" +
                        "Você poderá escolher:\n" +
                        "• O tipo de atendimento;\n" +
                        "• A modalidade online ou presencial;\n" +
                        "• Uma data e um horário ilustrativos.\n\n" +
                        "Nenhuma consulta real será reservada.",
                    link: {
                        pagina: "agendamento.html",
                        texto: "Simular agendamento"
                    }
                };
            }


            /* --------------------------------------
               LOCALIZAÇÃO
            -------------------------------------- */

            if (
                /\b(endereco|localizacao|onde fica|consultorio|porto alegre|presencial)\b/.test(texto)
            ) {

                return {
                    resposta:
                        "O site apresenta Porto Alegre, no Rio Grande do Sul, " +
                        "como cidade de referência para atendimento presencial.\n\n" +
                        "O endereço completo do local de atendimento ainda precisa " +
                        "ser confirmado pela responsável.\n\n" +
                        "Não disponibilizamos um endereço fictício.",
                    link: {
                        pagina: "contato.html",
                        texto: "Ver informações de contato"
                    }
                };
            }


            /* --------------------------------------
               CONTATO
            -------------------------------------- */

            if (
                /\b(contato|whatsapp|telefone|email|e-mail|falar com|mensagem)\b/.test(texto)
            ) {

                return {
                    resposta:
                        "Os canais oficiais de contato da Dra. Maurícia Mbani " +
                        "serão adicionados após confirmação.\n\n" +
                        "A página Contato apresenta os canais previstos e um " +
                        "formulário demonstrativo que não envia mensagens.",
                    link: {
                        pagina: "contato.html",
                        texto: "Abrir página de Contato"
                    }
                };
            }


            /* --------------------------------------
               SOBRE A MÉDICA
            -------------------------------------- */

            if (
                /\b(sobre|mauricia|medica|doutora|formacao|trajetoria|quem atende)\b/.test(texto)
            ) {

                return {
                    resposta:
                        "A página Sobre apresenta a Dra. Maurícia Mbani e a " +
                        "proposta de atendimento do site.\n\n" +
                        "As informações completas de formação, registro e trajetória " +
                        "profissional serão incluídas após validação.",
                    link: {
                        pagina: "sobre.html",
                        texto: "Conhecer a Dra. Maurícia"
                    }
                };
            }


            /* --------------------------------------
               SAUDAÇÕES
            -------------------------------------- */

            if (
                /^(oi|ola|bom dia|boa tarde|boa noite|e ai|tudo bem)[!?. ]*$/.test(texto)
            ) {

                return {
                    resposta:
                        "Olá! Seja bem-vindo(a)! 😊\n\n" +
                        "Posso ajudar você a conhecer os atendimentos, " +
                        "a consulta online e o agendamento demonstrativo.\n\n" +
                        "Selecione uma das perguntas sugeridas ou digite sua dúvida.",
                    link: null
                };
            }


            /* --------------------------------------
               AGRADECIMENTOS
            -------------------------------------- */

            if (
                /\b(obrigado|obrigada|valeu|agradeco)\b/.test(texto)
            ) {

                return {
                    resposta:
                        "Por nada! 😊\n\n" +
                        "Se quiser conhecer mais sobre os atendimentos, " +
                        "utilize as perguntas sugeridas ou explore o site.",
                    link: null
                };
            }


            /* --------------------------------------
               RESPOSTA PADRÃO
            -------------------------------------- */

            return {
                resposta:
                    "Ainda não tenho uma resposta automática para essa pergunta.\n\n" +
                    "Posso ajudar com informações gerais sobre:\n" +
                    "• Saúde Capilar;\n" +
                    "• Clínica Geral;\n" +
                    "• Consulta Online;\n" +
                    "• Agendamento;\n" +
                    "• Pagamento demonstrativo;\n" +
                    "• Localização e contato.\n\n" +
                    "Experimente uma das perguntas sugeridas.",
                link: null
            };

        }


        /* ==========================================
           7. CRIAR UMA MENSAGEM NO CHAT
        ========================================== */

        function criarMensagem(
            texto,
            tipo = "bot",
            link = null
        ) {

            const mensagem = document.createElement("div");

            mensagem.classList.add(
                "assistant-message"
            );

            if (tipo === "user") {

                mensagem.classList.add(
                    "assistant-message-user"
                );

            } else {

                mensagem.classList.add(
                    "assistant-message-bot"
                );
            }


            /* AVATAR */

            const avatar = document.createElement("div");

            avatar.className =
                "assistant-message-avatar";

            avatar.setAttribute(
                "aria-hidden",
                "true"
            );

            avatar.textContent =
                tipo === "user" ? "●" : "✦";


            /* CONTEÚDO */

            const conteudo = document.createElement("div");

            conteudo.className =
                "assistant-message-content";


            /* AUTOR */

            const autor = document.createElement("span");

            autor.className =
                "assistant-message-author";

            autor.textContent =
                tipo === "user"
                    ? "Você"
                    : "Assistente Virtual";


            /* BALÃO */

            const balao = document.createElement("div");

            balao.className =
                "assistant-message-bubble";


            /* TEXTO */

            const paragrafo = document.createElement("p");

            // textContent impede que conteúdo digitado
            // seja interpretado como HTML.

            paragrafo.textContent = texto;

            paragrafo.style.whiteSpace = "pre-line";

            balao.appendChild(paragrafo);


            /* LINK OPCIONAL */

            if (
                tipo === "bot" &&
                link &&
                link.pagina &&
                link.texto
            ) {

                const quebra = document.createElement("p");

                const ancora = document.createElement("a");

                ancora.href = link.pagina;

                ancora.textContent =
                    link.texto + " →";

                quebra.appendChild(ancora);

                balao.appendChild(quebra);
            }


            /* MONTAGEM */

            conteudo.appendChild(autor);
            conteudo.appendChild(balao);

            mensagem.appendChild(avatar);
            mensagem.appendChild(conteudo);

            mensagens.appendChild(mensagem);

            // Rola para a última mensagem.

            mensagens.scrollTop =
                mensagens.scrollHeight;
        }


        /* ==========================================
           8. PROCESSAR PERGUNTA
        ========================================== */

        function enviarPergunta(texto) {

            const pergunta = texto
                .trim()
                .slice(0, TAMANHO_MAXIMO);

            if (!pergunta) {
                return;
            }

            // Não reproduz dados pessoais detectados.

            if (contemDadosPessoais(pergunta)) {

                criarMensagem(
                    "Por segurança, evite compartilhar " +
                    "telefone, e-mail, documentos ou " +
                    "outros dados pessoais neste chat.\n\n" +
                    "Reformule sua pergunta sem incluir " +
                    "essas informações.",
                    "bot"
                );

                return;
            }

            // Perguntas clínicas individuais não são
            // reproduzidas no histórico visual.

            const textoNormalizado =
                normalizarTexto(pergunta);

            if (
                perguntaMedicaIndividual(textoNormalizado)
            ) {

                const respostaClinica =
                    encontrarResposta(pergunta);

                criarMensagem(
                    respostaClinica.resposta,
                    "bot",
                    respostaClinica.link
                );

                return;
            }

            // Mensagem do visitante.

            criarMensagem(
                pergunta,
                "user"
            );


            /* RESPOSTA */

            const resultado =
                encontrarResposta(pergunta);

            criarMensagem(
                resultado.resposta,
                "bot",
                resultado.link
            );

        }


        /* ==========================================
           9. ENVIO PELO FORMULÁRIO
        ========================================== */

        formulario.addEventListener(
            "submit",
            (evento) => {

                evento.preventDefault();

                const pergunta = campo.value;

                campo.value = "";

                enviarPergunta(pergunta);

                campo.focus();
            }
        );


        /* ==========================================
           10. PERGUNTAS SUGERIDAS
        ========================================== */

        sugestoes.forEach((botao) => {

            botao.addEventListener(
                "click",
                () => {

                    const pergunta =
                        botao.dataset.question;

                    if (!pergunta) {
                        return;
                    }

                    enviarPergunta(pergunta);
                }
            );

        });


        /* ==========================================
           11. REINICIAR CONVERSA
        ========================================== */

        botaoLimpar.addEventListener(
            "click",
            () => {

                // Remove as mensagens criadas na sessão
                // e restaura a saudação original.

                mensagens.replaceChildren(
                    ...Array.from(
                        mensagemInicial.children,
                        (elemento) => elemento.cloneNode(true)
                    )
                );

                campo.value = "";

                mensagens.scrollTop = 0;

                campo.focus();
            }
        );


        /* ==========================================
           12. VERIFICAÇÃO INICIAL
        ========================================== */

        console.log(
            "Assistente Virtual da Dra. Maurícia " +
            "Mbani iniciado em modo demonstrativo."
        );

    });

})();
