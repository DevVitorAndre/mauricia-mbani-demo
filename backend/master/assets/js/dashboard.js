
const $ = (id) => document.getElementById(id);

const formClinica = $("formClinica");
const btnCadastrar = $("btnCadastrar");

function mostrarMensagem(id, texto, tipo = "") {
  const elemento = $(id);
  elemento.textContent = texto;
  elemento.className = `feedback ${tipo}`;
}

async function requisicao(url, opcoes = {}) {
  const resposta = await fetch(url, {
    credentials: "same-origin",
    cache: "no-store",
    ...opcoes
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(
      dados.mensagem || `Erro HTTP ${resposta.status}`
    );
  }

  return dados;
}

// =====================================
// VALIDAR O MASTER
// =====================================

async function carregarUsuario() {
  const dados = await requisicao("/api/auth/me");

  if (!dados.autenticado ||
      dados.usuario.perfil !== "master") {
    throw new Error("Sessão inválida.");
  }

  $("boasVindas").textContent =
    `Bem-vindo, ${dados.usuario.nome}!`;

  $("usuarioEmail").textContent = dados.usuario.email;
}

// =====================================
// BUSCAR OS PLANOS DO POSTGRESQL
// =====================================

async function carregarPlanos() {
  const dados = await requisicao("/api/planos");

  $("totalPlanos").textContent = dados.total;

  const select = $("planoClinica");

  select.replaceChildren();

  const inicial = document.createElement("option");
  inicial.value = "";
  inicial.textContent = "Selecione um plano";
  select.appendChild(inicial);

  dados.planos.forEach((plano) => {
    const option = document.createElement("option");

    option.value = plano.codigo;

    const valor = Number(plano.valor_mensal)
      .toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      });

    option.textContent = `${plano.nome} - ${valor}/mês`;

    select.appendChild(option);
  });
}

// =====================================
// LISTAR AS CLINICAS
// =====================================

function adicionarCelula(linha, texto) {
  const celula = document.createElement("td");
  celula.textContent = String(texto ?? "-");
  linha.appendChild(celula);
}

async function carregarClinicas() {
  const dados = await requisicao("/api/master/clinicas");

  const clinicas = dados.clinicas;

  $("totalEmpresas").textContent = dados.total;

  $("clinicasAtivas").textContent = clinicas.filter(
    (clinica) => clinica.status === "ativa"
  ).length;

  const tabela = $("tabelaClinicas");
  tabela.replaceChildren();

  if (clinicas.length === 0) {
    const linha = document.createElement("tr");
    const celula = document.createElement("td");

    celula.colSpan = 4;
    celula.textContent = "Nenhuma clínica cadastrada.";

    linha.appendChild(celula);
    tabela.appendChild(linha);
    return;
  }

  clinicas.forEach((clinica) => {
    const linha = document.createElement("tr");

    adicionarCelula(linha, clinica.nome);
    adicionarCelula(linha, clinica.slug);
    adicionarCelula(linha, clinica.plano);
    adicionarCelula(
      linha,
      clinica.status_assinatura || "Sem assinatura"
    );

    tabela.appendChild(linha);
  });
}

// =====================================
// GERAR SLUG A PARTIR DO NOME
// =====================================

function gerarSlug(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

let slugEditado = false;

$("slugClinica").addEventListener("input", () => {
  slugEditado = true;
});

$("nomeClinica").addEventListener("input", (evento) => {
  if (!slugEditado) {
    $("slugClinica").value = gerarSlug(evento.target.value);
  }
});

// =====================================
// CADASTRAR UMA NOVA CLINICA
// =====================================

formClinica.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  mostrarMensagem("mensagemCadastro", "");

  btnCadastrar.disabled = true;
  btnCadastrar.textContent = "Cadastrando...";

  const novaClinica = {
    nome: $("nomeClinica").value.trim(),
    slug: $("slugClinica").value.trim().toLowerCase(),
    email: $("emailClinica").value.trim(),
    telefone: $("telefoneClinica").value.trim(),
    plano_codigo: $("planoClinica").value
  };

  try {
    // Buscar token de proteção da sessão.
    const csrf = await requisicao(
      "/api/master/clinicas/csrf"
    );

    // Enviar cadastro para o backend.
    const resultado = await requisicao(
      "/api/master/clinicas",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrf.csrfToken
        },
        body: JSON.stringify(novaClinica)
      }
    );

    mostrarMensagem(
      "mensagemCadastro",
      resultado.mensagem,
      "sucesso"
    );

    formClinica.reset();
    slugEditado = false;

    await carregarClinicas();

  } catch (erro) {
    mostrarMensagem(
      "mensagemCadastro",
      erro.message,
      "erro"
    );

  } finally {
    btnCadastrar.disabled = false;
    btnCadastrar.textContent = "Cadastrar clínica";
  }
});

// =====================================
// SAIR DO SISTEMA
// =====================================

$("btnSair").addEventListener("click", async () => {
  try {
    await requisicao("/api/auth/logout", {
      method: "POST"
    });

    window.location.replace("/master/login");

  } catch (erro) {
    alert("Erro ao sair: " + erro.message);
  }
});

// =====================================
// INICIAR DASHBOARD
// =====================================

// =====================================
// MOSTRAR MODULOS POR PLANO
// =====================================

async function carregarModulos() {

  const dados = await requisicao(
    "/api/master/modulos"
  );

  const tabela = $("tabelaModulos");

  tabela.replaceChildren();

  const planos = ["basico", "plus", "pro"];

  dados.modulos.forEach((modulo) => {

    const linha = document.createElement("tr");

    // Nome da funcionalidade
    adicionarCelula(linha, modulo.nome);

    // Verificar cada plano
    planos.forEach((plano) => {

      const celula = document.createElement("td");

      const permitido =
        modulo.ativo &&
        modulo.planos.includes(plano);

      const indicador =
        document.createElement("span");

      indicador.className = permitido
        ? "modulo-ativo"
        : "modulo-inativo";

      indicador.textContent = permitido
        ? "✓"
        : "—";

      indicador.setAttribute(
        "aria-label",
        permitido ? "Incluido" : "Nao incluido"
      );

      celula.appendChild(indicador);
      linha.appendChild(celula);

    });

    tabela.appendChild(linha);

  });

  $("mensagemModulos").textContent =
    `${dados.total} funcionalidades cadastradas.`;
}

async function iniciarDashboard() {
  try {
    await carregarUsuario();

  } catch {
    window.location.replace("/master/login");
    return;
  }

  try {
    await Promise.all([
      carregarPlanos(),
      carregarClinicas(),
        carregarModulos(),
        carregarClinicasControle()
    ]);

  } catch (erro) {
    console.error(erro);

    mostrarMensagem(
      "mensagemLista",
      "Erro ao carregar dados: " + erro.message,
      "erro"
    );
  }
}

// ==========================================
// CONTROLE DE MODULOS POR CLINICA
// ==========================================

const seletorClinica = $("clinicaModulo");
const tabelaControle = $("tabelaControleModulos");

let salvandoModulo = false;

// Mostrar uma mensagem na tabela.
function mensagemNaTabela(texto) {
  tabelaControle.replaceChildren();

  const linha = document.createElement("tr");
  const celula = document.createElement("td");

  celula.colSpan = 5;
  celula.textContent = texto;

  linha.appendChild(celula);
  tabelaControle.appendChild(linha);
}

// Carregar as clinicas no seletor.
async function carregarClinicasControle() {
  const dados = await requisicao(
    "/api/master/clinicas"
  );

  seletorClinica.replaceChildren();

  const inicial = document.createElement("option");

  inicial.value = "";
  inicial.textContent = "Selecione uma clínica";

  seletorClinica.appendChild(inicial);

  dados.clinicas.forEach((clinica) => {
    const opcao = document.createElement("option");

    opcao.value = clinica.id;
    opcao.textContent = clinica.nome;

    seletorClinica.appendChild(opcao);
  });
}

// Criar botoes para controlar cada modulo.
function criarBotao(legenda, valor, codigo) {
  const botao = document.createElement("button");

  botao.type = "button";
  botao.textContent = legenda;
  botao.className = "btn-modulo";

  botao.dataset.codigo = codigo;
  botao.dataset.valor = valor;

  return botao;
}

// Buscar o estado dos modulos da clinica.
async function carregarControleModulos() {
  const clinicaId = seletorClinica.value;

  if (!clinicaId) {
    mensagemNaTabela("Selecione uma clínica.");
    return;
  }

  mensagemNaTabela("Carregando módulos...");

  try {
    const dados = await requisicao(
      `/api/master/clinicas/${clinicaId}/modulos`
    );

    tabelaControle.replaceChildren();

    dados.modulos.forEach((modulo) => {
      const linha = document.createElement("tr");

      // Nome
      adicionarCelula(linha, modulo.nome);

      // Incluido no plano
      adicionarCelula(
        linha,
        modulo.incluido_plano ? "Sim" : "Não"
      );

      // Status final
      adicionarCelula(
        linha,
        modulo.habilitado_final
          ? "✅ Liberado"
          : "🔒 Bloqueado"
      );

      // Configuracao manual
      let configuracao = "Padrão do plano";

      if (modulo.excecao_master === true) {
        configuracao = "Liberação manual";
      }

      if (modulo.excecao_master === false) {
        configuracao = "Bloqueio manual";
      }

      adicionarCelula(linha, configuracao);

      // Acoes
      const celulaAcoes = document.createElement("td");
      const grupo = document.createElement("div");

      grupo.className = "modulo-acoes";

      grupo.appendChild(
        criarBotao("Liberar", "true", modulo.codigo)
      );

      grupo.appendChild(
        criarBotao("Bloquear", "false", modulo.codigo)
      );

      grupo.appendChild(
        criarBotao("Padrão", "null", modulo.codigo)
      );

      celulaAcoes.appendChild(grupo);
      linha.appendChild(celulaAcoes);

      tabelaControle.appendChild(linha);
    });

    mostrarMensagem("mensagemControle", "");

  } catch (erro) {
    mensagemNaTabela("Erro ao carregar os módulos.");

    mostrarMensagem(
      "mensagemControle",
      erro.message,
      "erro"
    );
  }
}

// Alterar configuracao usando PATCH.
async function atualizarModulo(codigo, valor) {
  const clinicaId = seletorClinica.value;

  if (!clinicaId || salvandoModulo) return;

  let habilitado = null;

  if (valor === "true") habilitado = true;
  if (valor === "false") habilitado = false;

  salvandoModulo = true;
  seletorClinica.disabled = true;

  tabelaControle.querySelectorAll("button")
    .forEach((botao) => {
      botao.disabled = true;
    });

  try {
    const csrf = await requisicao(
      "/api/master/clinicas/csrf"
    );

    const resultado = await requisicao(
      `/api/master/clinicas/${clinicaId}/modulos/${encodeURIComponent(codigo)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrf.csrfToken
        },
        body: JSON.stringify({ habilitado })
      }
    );

    await carregarControleModulos();

    mostrarMensagem(
      "mensagemControle",
      resultado.mensagem,
      "sucesso"
    );

  } catch (erro) {
    mostrarMensagem(
      "mensagemControle",
      erro.message,
      "erro"
    );

  } finally {
    salvandoModulo = false;
    seletorClinica.disabled = false;

    tabelaControle.querySelectorAll("button")
      .forEach((botao) => {
        botao.disabled = false;
      });
  }
}

// Trocar de clínica.
seletorClinica.addEventListener(
  "change",
  carregarControleModulos
);

// Eventos dos botoes.
tabelaControle.addEventListener("click", (evento) => {
  const botao = evento.target.closest("button[data-codigo]");

  if (!botao || salvandoModulo) return;

  atualizarModulo(
    botao.dataset.codigo,
    botao.dataset.valor
  );
});

iniciarDashboard();
