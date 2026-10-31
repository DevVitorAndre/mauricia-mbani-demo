
import "dotenv/config";

import express from "express";
import helmet from "helmet";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { db, testarConexao } from "./db.js";
import planosRoutes from "./routes/planos.routes.js";
import authRoutes from "./routes/auth.routes.js";
import clinicasRoutes from "./routes/clinicas.routes.js";
import modulosRoutes from "./routes/modulos.routes.js";
import convitesRoutes from "./routes/convites.routes.js";
import ativacaoRoutes from "./routes/ativacao.routes.js";
import clinicaAuthRoutes from "./routes/clinica-auth.routes.js";
import { consultarPermissao } from "./services/permissoes.service.js";
import agendamentosRoutes from "./routes/agendamentos.routes.js";




// ========================================
// CONFIGURACOES INICIAIS
// ========================================

const app = express();

app.locals.db = db;

const PgStore = connectPgSimple(session);

const producao = process.env.NODE_ENV === "production";

// Localizar a pasta backend
const __dirname = path.dirname(
  fileURLToPath(import.meta.url)
);

const pastaMaster = path.resolve(
  __dirname,
  "../master"
);



console.log("📁 Pasta Master:", pastaMaster);


// Pasta principal do projeto Mauricia Mbani
const pastaProjeto = path.resolve(
  pastaMaster,
  "../.."
);


// ========================================
// SEGURANCA
// ========================================

if (
  !process.env.SESSION_SECRET ||
  process.env.SESSION_SECRET.length < 32
) {
  throw new Error(
    "SESSION_SECRET deve ter ao menos 32 caracteres."
  );
}

app.use(helmet());
app.use(express.json({ limit: "20kb" }));

if (producao) {
  app.set("trust proxy", 1);
}

// ========================================
// SESSOES NO POSTGRESQL
// ========================================

app.use(session({
  name: "saas.master.sid",

  store: new PgStore({
    pool: db,
    tableName: "sessoes",
    createTableIfMissing: false
  }),

  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,

  cookie: {
    httpOnly: true,
    secure: producao,
    sameSite: "lax",
    maxAge: 8 * 60 * 60 * 1000
  }
}));

// ========================================
// ARQUIVOS CSS E JAVASCRIPT DO MASTER
// ========================================

app.use(
  "/master/assets",
  express.static(
    path.join(pastaMaster, "assets")
  )
);

// ========================================
// STATUS DO SERVIDOR
// ========================================

app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    sistema: "SaaS Master",
    mensagem: "Backend funcionando!"
  });
});

// ========================================
// TESTE DO POSTGRESQL
// ========================================

app.get("/api/database", async (req, res) => {
  try {
    await testarConexao();

    return res.json({
      status: "conectado",
      banco: "PostgreSQL"
    });

  } catch (erro) {
    console.error("Erro PostgreSQL:", erro.message);

    return res.status(503).json({
      status: "indisponivel",
      mensagem: "Nao foi possivel conectar ao banco."
    });
  }
});


// CSS, JavaScript e imagens do projeto original
app.use(
  "/assets",
  express.static(
    path.join(pastaProjeto, "assets")
  )
);

// ========================================
// ROTAS DA API
// ========================================

app.use("/api/planos", planosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/master/clinicas", clinicasRoutes);
app.use("/api/master/modulos", modulosRoutes);
app.use("/api/master/convites", convitesRoutes);
app.use("/api/ativacao", ativacaoRoutes);
app.use("/api/clinica/auth", clinicaAuthRoutes);
app.use("/api/clinica/agendamentos", agendamentosRoutes);



// ========================================
// PROTECAO DAS PAGINAS MASTER
// ========================================

async function protegerMaster(req, res, next) {

  if (
    !req.session?.usuarioId ||
    req.session.perfil !== "master"
  ) {
    return res.redirect("/master/login");
  }

  try {
    const resultado = await db.query(
      `SELECT id
       FROM usuarios
       WHERE id = $1
         AND perfil = 'master'
         AND ativo = TRUE`,
      [req.session.usuarioId]
    );

    if (resultado.rowCount === 0) {
      return res.redirect("/master/login");
    }

    next();

  } catch (erro) {
    console.error(
      "Erro ao validar Master:",
      erro.message
    );

    return res.status(503).send(
      "Sistema temporariamente indisponivel."
    );
  }
}

// ========================================
// PAGINAS DO PAINEL MASTER
// ========================================

// Pagina de login
app.get("/master/login", (req, res) => {
  res.sendFile(
    path.join(pastaMaster, "login.html")
  );
});

// Dashboard protegido
app.get(
  "/master/dashboard",
  protegerMaster,
  (req, res) => {
    res.sendFile(
      path.join(pastaMaster, "dashboard.html")
    );
  }
);

// Redirecionamento inicial
app.get("/master", (req, res) => {
  res.redirect("/master/login");
});

// ========================================
// INICIAR SERVIDOR
// ========================================

const PORT = Number(process.env.PORT) || 3000;


// ========================================
// PAGINA DE ATIVACAO DAS CLINICAS
// ========================================

const pastaClinica = path.resolve(
  pastaMaster,
  "../clinica"
);

// Arquivos CSS e JavaScript da clínica
app.use(
  "/clinica/assets",
  express.static(
    path.join(pastaClinica, "assets")
  )
);

// Página de ativação
app.get("/clinica/ativar", (req, res) => {
  res.set("Cache-Control", "no-store");

  res.sendFile(
    path.join(pastaClinica, "ativar.html")
  );
});


// ========================================
// LOGIN VISUAL DA CLINICA
// ========================================


app.get("/clinica/login", (req, res) => {
  res.set("Cache-Control", "no-store");

  return res.sendFile(
    path.join(pastaProjeto, "admin", "login.html")
  );
});



// ============================================
// PAINEL ORIGINAL DA CLINICA
// ============================================

// Paginas e modulos exigidos
const paginasClinica = new Map([
  ["dashboard.html", "painel_clinica"],
  ["agenda.html", "agenda_online"],
  ["pacientes.html", "painel_clinica"],
  ["financeiro.html", "financeiro"],
  ["servicos.html", "painel_clinica"],
  ["relatorios.html", "financeiro"],
  ["configuracoes.html", "painel_clinica"]
]);

// O login demonstrativo antigo não será utilizado.
app.get("/admin/login.html", (req, res) => {
  return res.redirect("/clinica/login");
});

// Proteger todas as paginas administrativas.
app.get("/admin/:arquivo", async (req, res) => {
  const arquivo = req.params.arquivo;
  const modulo = paginasClinica.get(arquivo);

  if (!modulo) {
    return res.status(404).send("Página não encontrada.");
  }

  const sessao = req.session;

  if (
    sessao?.perfil !== "admin_clinica" ||
    !sessao.usuarioId ||
    !sessao.clinicaId
  ) {
    return res.redirect("/clinica/login");
  }

  try {
    // Confirmar identidade e vínculo com a clínica
    const usuario = await db.query(
      `SELECT u.id
       FROM usuarios u
       JOIN clinicas c ON c.id = u.clinica_id
       WHERE u.id = $1
         AND u.clinica_id = $2
         AND u.perfil = 'admin_clinica'
         AND u.ativo = TRUE
         AND c.status = 'ativa'`,
      [
        sessao.usuarioId,
        sessao.clinicaId
      ]
    );

    if (!usuario.rowCount) {
      return res.status(403).send(
        "Usuário sem autorização."
      );
    }

    // Verificar se o plano permite abrir a pagina
    const permissao = await consultarPermissao(
      sessao.clinicaId,
      modulo
    );

    if (!permissao?.permitido) {
      return res.status(403).send(
        "Funcionalidade não disponível para esta clínica."
      );
    }

    // Entregar o HTML original da Dra. Maurícia
    res.set("Cache-Control", "no-store");

    return res.sendFile(
      path.join(pastaProjeto, "admin", arquivo)
    );

  } catch (erro) {
    console.error(
      "Erro no painel da clínica:",
      erro.message
    );

    return res.status(503).send(
      "Painel temporariamente indisponível."
    );
  }
});


app.listen(PORT, "127.0.0.1", () => {

  console.log("==================================");
  console.log("🚀 SAAS MASTER INICIADO!");
  console.log(`Servidor: http://localhost:${PORT}`);
  console.log("✅ PostgreSQL configurado");
  console.log("🔐 Autenticacao Master habilitada");
  console.log("🎨 Arquivos CSS e JS habilitados");
  console.log("==================================");

});
