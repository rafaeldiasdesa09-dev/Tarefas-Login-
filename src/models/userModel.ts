import { readFile, writeFile } from "fs/promises";
import bcrypt from "bcrypt";

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER"
}

export interface User {
  id: number;
  nome: string;
  email: string;
  senha: string;
  role: Role;
}

const ARQUIVO = "dados/usuarios.json";
const SALT_ROUNDS = 10;

// Garante que o arquivo exista
async function inicializarArquivo(): Promise<void> {
  try {
    await readFile(ARQUIVO, "utf-8");
  } catch {
    await writeFile(ARQUIVO, JSON.stringify([]), "utf-8");
  }
}

// Carregar usuários
export async function carregar(): Promise<User[]> {
  await inicializarArquivo();

  const dados = await readFile(ARQUIVO, "utf-8");

  return JSON.parse(dados || "[]");
}

// Salvar usuários
export async function salvar(users: User[]): Promise<void> {
  await writeFile(
    ARQUIVO,
    JSON.stringify(users, null, 2),
    "utf-8"
  );
}

// Buscar por email
export async function buscarPorEmail(
  email: string
): Promise<User | undefined> {
  const usuarios = await carregar();

  return usuarios.find((u) => u.email === email);
}

// Buscar por id
export async function buscarPorId(
  id: number
): Promise<User | undefined> {
  const usuarios = await carregar();

  return usuarios.find((u) => u.id === id);
}

// Listar todos os usuários (necessário para /admin)
export async function listarUsuarios(): Promise<User[]> {
  return await carregar();
}

// Registrar usuário
export async function registrar(
  nome: string,
  email: string,
  senhaTexto: string
): Promise<User> {

  const usuarios = await carregar();

  // Verificar email duplicado
  const usuarioExistente = usuarios.find(
    (u) => u.email === email
  );

  if (usuarioExistente) {
    throw new Error(
      "Este e-mail já está cadastrado."
    );
  }

  // Gerar hash da senha
  const senhaHash = await bcrypt.hash(
    senhaTexto,
    SALT_ROUNDS
  );

  // ID incremental
  const novoId =
    usuarios.length > 0
      ? usuarios[usuarios.length - 1].id + 1
      : 1;

  // Primeiro usuário vira ADMIN
  const role =
    usuarios.length === 0
      ? Role.ADMIN
      : Role.USER;

  const novoUsuario: User = {
    id: novoId,
    nome,
    email,
    senha: senhaHash,
    role
  };

  usuarios.push(novoUsuario);

  await salvar(usuarios);

  return novoUsuario;
}

// Login
export async function login(
  email: string,
  senhaTexto: string
): Promise<User | null> {

  const usuario = await buscarPorEmail(email);

  if (!usuario) {
    return null;
  }

  const senhaCorreta = await bcrypt.compare(
    senhaTexto,
    usuario.senha
  );

  if (!senhaCorreta) {
    return null;
  }

  return usuario;
}