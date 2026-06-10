import { readFile, writeFile } from "fs/promises";
import bcrypt from "bcrypt";

export interface User {
  id: number;
  nome: string;
  email: string;
  senha: string;
}

const ARQUIVO = "dados/usuarios.json";
const SALT_ROUNDS = 10;

// Auxiliar para garantir que o arquivo exista e não quebre o JSON.parse
async function inicializarArquivo(): Promise<void> {
  try {
    await readFile(ARQUIVO, "utf-8");
  } catch {
    await writeFile(ARQUIVO, JSON.stringify([]), "utf-8");
  }
}

// Funções para criar:

export async function carregar(): Promise<User[]> {
  await inicializarArquivo();
  const dados = await readFile(ARQUIVO, "utf-8");
  return JSON.parse(dados || "[]");
}

export async function salvar(users: User[]): Promise<void> {
  await writeFile(ARQUIVO, JSON.stringify(users, null, 2), "utf-8");
}

export async function buscarPorEmail(email: string): Promise<User | undefined> {
  const usuarios = await carregar();
  return usuarios.find((u) => u.email === email);
}

export async function buscarPorId(id: number): Promise<User | undefined> {
  const usuarios = await carregar();
  return usuarios.find((u) => u.id === id);
}

export async function registrar(nome: string, email: string, senhaTexto: string): Promise<User> {
  const usuarios = await carregar();

  // → verificar email duplicado
  const usuarioExistente = usuarios.find((u) => u.email === email);
  if (usuarioExistente) {
    throw new Error("Este e-mail já está cadastrado.");
  }

  // → bcrypt.hash(senhaTexto, SALT_ROUNDS)
  const senhaHash = await bcrypt.hash(senhaTexto, SALT_ROUNDS);

  // Gerar ID incremental simples
  const novoId = usuarios.length > 0 ? usuarios[usuarios.length - 1].id + 1 : 1;

  const novoUsuario: User = {
    id: novoId,
    nome,
    email,
    senha: senhaHash,
  };

  // → salvar com hash
  usuarios.push(novoUsuario);
  await salvar(usuarios);

  return novoUsuario;
}

export async function login(email: string, senhaTexto: string): Promise<User | null> {
  // → buscar por email
  const usuario = await buscarPorEmail(email);
  if (!usuario) {
    return null;
  }

  // → bcrypt.compare(senhaTexto, user.senha)
  const senhaCorreta = await bcrypt.compare(senhaTexto, usuario.senha);

  // → retornar user se correto, null se errado
  if (senhaCorreta) {
    return usuario;
  }

  return null;
}