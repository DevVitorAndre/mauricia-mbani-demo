
import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

export const db = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE
});

db.on("error", (erro) => {
  console.error("Erro no PostgreSQL:", erro.message);
});

export async function testarConexao() {
  const resultado = await db.query("SELECT NOW()");

  console.log("✅ PostgreSQL conectado com sucesso!");

  return resultado.rows[0];
}
