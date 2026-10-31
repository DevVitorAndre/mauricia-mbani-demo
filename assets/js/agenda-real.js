
/*
  AGENDA REAL - DRA. MAURICIA MBANI
  Consulta agendamentos no PostgreSQL pela API.
  Primeira fase: visualizacao da agenda.
*/

document.addEventListener("DOMContentLoaded", () => {
  const elemento = (id) => document.getElementById(id);

  const grade = elemento("agenda-week-grid");
  const tabela = elemento("agenda-table-body");
  const tituloSemana = elemento("agenda-week-label");
  const contador = elemento("agenda-results-count");
  const vazio = elemento("agenda-empty-state");

  const filtroServico = elemento("agenda-filter-service");
  const filtroStatus = elemento("agenda-filter-status");
  const filtroModalidade = elemento("agenda-filter-modality");

  const dias = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];

  let consultas = [];
  let numeroRequisicao = 0;

  function dataLocal(data) {
    const [ano, mes, dia] = data.split("-").map(Number);
    return new Date(ano, mes - 1, dia, 12);
  }

  function iso(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  }

  function adicionarDias(data, dias) {
    const nova = new Date(data);
    nova.setDate(nova.getDate() + dias);
    return nova;
  }

  function inicioSemana(data) {
    const dia = data.getDay();
    return adicionarDias(data, dia === 0 ? -6 : 1 - dia);
  }

  const parametro = new URLSearchParams(location.search).get("data");

  const dataInicial = /^\d{4}-\d{2}-\d{2}$/.test(parametro || "")
    ? dataLocal(parametro)
    : new Date();

  let semana = inicioSemana(dataInicial);

  function criar(tag, classe, texto) {
    const el = document.createElement(tag);
    if (classe) el.className = classe;
    if (texto !== undefined) el.textContent = String(texto);
    return el;
  }

  function situacao(status) {
    const nomes = {
      pendente: "Pendente",
      confirmado: "Confirmada",
      concluido: "Concluída",
      cancelado: "Cancelada"
    };
    return nomes[status] || status;
  }

  function classeStatus(status) {
    if (status === "confirmado" || status === "concluido") {
      return "confirmed";
    }
    if (status === "cancelado") return "cancelled";
    return "pending";
  }

  function renderizar() {
    grade.replaceChildren();
    tabela.replaceChildren();

    const inicio = iso(semana);
    const fim = iso(adicionarDias(semana, 6));

    tituloSemana.textContent = `${inicio} a ${fim}`;

    const filtradas = consultas.filter((c) => {
      const servicoOK =
        filtroServico.value === "todos" ||
        c.servico === filtroServico.value;

      const statusOK =
        filtroStatus.value === "todas" ||
        situacao(c.status) === filtroStatus.value;

      return servicoOK && statusOK;
    });

    elemento("agenda-total").textContent =
      String(consultas.length).padStart(2, "0");

    elemento("agenda-confirmed").textContent =
      String(consultas.filter(c => c.status === "confirmado").length)
        .padStart(2, "0");

    elemento("agenda-pending").textContent =
      String(consultas.filter(c => c.status === "pendente").length)
        .padStart(2, "0");

    // A modalidade ainda nao existe no banco.
    elemento("agenda-online").textContent = "—";

    contador.textContent = `${filtradas.length} registro(s)`;
    vazio.hidden = filtradas.length > 0;

    for (let i = 0; i < 7; i++) {
      const data = adicionarDias(semana, i);
      const dataISO = iso(data);

      const coluna = criar("div", "agenda-day");
      const cabecalho = criar("div", "agenda-day-header");
      const eventos = criar("div", "agenda-day-events");

      cabecalho.append(
        criar("span", "", dias[i]),
        criar("strong", "", String(data.getDate()).padStart(2, "0"))
      );

      const consultasDia = filtradas.filter(
        c => c.data === dataISO
      );

      if (consultasDia.length === 0) {
        eventos.append(
          criar("p", "agenda-empty-day", "Sem consultas")
        );
      }

      consultasDia.forEach((consulta) => {
        const card = criar(
          "div",
          `agenda-event ${classeStatus(consulta.status)}`
        );

        card.append(
          criar("span", "agenda-event-time", consulta.horario),
          criar("strong", "", consulta.paciente),
          criar("small", "", consulta.servico)
        );

        eventos.append(card);
      });

      coluna.append(cabecalho, eventos);
      grade.append(coluna);
    }

    filtradas.forEach((consulta) => {
      const linha = document.createElement("tr");

      const valores = [
        consulta.data.split("-").reverse().join("/"),
        consulta.horario,
        consulta.paciente,
        consulta.servico,
        "—",
        situacao(consulta.status),
        "—"
      ];

      valores.forEach((valor) => {
        linha.append(criar("td", "", valor));
      });

      tabela.append(linha);
    });
  }

  async function carregarSemana() {
    const requisicaoAtual = ++numeroRequisicao;

    grade.replaceChildren();
    tabela.replaceChildren();
    consultas = [];

    contador.textContent = "Carregando agendamentos...";
    vazio.hidden = true;

    const datas = Array.from(
      { length: 7 },
      (_, i) => iso(adicionarDias(semana, i))
    );

    try {
      const resultados = await Promise.all(
        datas.map(async (data) => {
          const resposta = await fetch(
            `/api/clinica/agendamentos?data=${data}`,
            {
              credentials: "same-origin",
              cache: "no-store"
            }
          );

          if (resposta.status === 401) {
            window.location.replace("/clinica/login");
            throw new Error("Sessão expirada.");
          }

          if (!resposta.ok) {
            throw new Error(`Erro HTTP ${resposta.status}`);
          }

          const dados = await resposta.json();
          return dados.agendamentos;
        })
      );

      if (requisicaoAtual !== numeroRequisicao) return;

      consultas = resultados.flat().map((a) => ({
        id: a.id,
        data: String(a.data_agendamento).slice(0, 10),
        horario: String(a.hora_inicio).slice(0, 5),
        paciente: a.paciente_nome,
        servico: a.servico,
        status: a.status
      }));

      renderizar();

    } catch (erro) {
      if (requisicaoAtual !== numeroRequisicao) return;

      console.error("Erro na agenda:", erro);

      contador.textContent = "Erro ao carregar agenda.";
      grade.replaceChildren();
      tabela.replaceChildren();
    }
  }

  elemento("agenda-prev-week").addEventListener("click", () => {
    semana = adicionarDias(semana, -7);
    carregarSemana();
  });

  elemento("agenda-next-week").addEventListener("click", () => {
    semana = adicionarDias(semana, 7);
    carregarSemana();
  });

  elemento("agenda-today-button").addEventListener("click", () => {
    semana = inicioSemana(new Date());
    carregarSemana();
  });

  filtroServico.addEventListener("change", renderizar);
  filtroStatus.addEventListener("change", renderizar);

  elemento("agenda-clear-filters").addEventListener("click", () => {
    filtroServico.value = "todos";
    filtroStatus.value = "todas";
    renderizar();
  });

  // Funcionalidades que serao integradas depois.
  filtroModalidade.disabled = true;

  const botaoNovo = elemento("agenda-new-button");
  botaoNovo.disabled = true;
  botaoNovo.title = "Cadastro pelo painel em desenvolvimento";

  // Limpar o aviso antigo do estado vazio.
  const textoVazio = vazio.querySelector("p");
  if (textoVazio) {
    textoVazio.textContent =
      "Não há agendamentos para esta semana e filtros.";
  }

  carregarSemana();
});
