
import "dotenv/config";

import bcrypt from "bcryptjs";
import { input, password } from "@inquirer/prompts";
import { db } from "../src/db.js";

async function criarMaster() {
  try {
    console.log("==================================");
    console.log("🚀 SAAS MASTER - CADASTRO INICIAL");
    console.log("==================================");

    // Verificar se ja existe um Master.
    const existente = await db.query(`
      SELECT id
      FROM usuarios
      WHERE perfil = 'master'
      LIMIT 1
    `);

    if (existente.rowCount > 0) {
      console.log("⚠️ Ja existe um usuario Master.");
      console.log("Cadastro inicial bloqueado.");
      return;
    }

    // Solicitar informacoes do administrador.
    const nome = (await input({
      message: "Nome do administrador:"
    })).trim();

    const email = (await input({
      message: "E-mail do administrador:"
    })).trim().toLowerCase();

    const senha = await password({
      message: "Crie uma senha forte:",
      mask: "*"
    });

    const confirmarSenha = await password({
      message: "Confirme sua senha:",
      mask: "*"
    });

    // Validacoes basicas.
    if (nome.length < 3 || nome.length > 150) {
      throw new Error("Nome deve ter de 3 a 150 caracteres.");
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 255
    ) {
      throw new Error("E-mail invalido.");
    }

    if (
      senha.length < 12 ||
      Buffer.byteLength(senha, "utf8") > 72
    ) {
      throw new Error(
        "A senha deve ter no minimo 12 caracteres e no maximo 72 bytes."
      );
    }

    if (senha !== confirmarSenha) {
      throw new Error("As senhas nao coincidem.");
    }

    // Gerar hash seguro.
    const senhaHash = await bcrypt.hash(senha, 12);

    // Salvar usuario Master no PostgreSQL.
    const resultado = await db.query(`
      INSERT INTO usuarios (
        nome,
        email,
        senha_hash,
        perfil,
        clinica_id,
        ativo
      )
      VALUES ($1, $2, $3, 'master', NULL, TRUE)
      RETURNING id, nome, email, perfil
    `, [nome, email, senhaHash]);

    console.log("");
    console.log("✅ MASTER CADASTRADO COM SUCESSO!");
    console.table(resultado.rows);

  } catch (erro) {
    console.error("❌ Erro:", erro.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

criarMaster();
