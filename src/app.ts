import express from "express";
import path from "path";
// 🎯 TODO 2: Importar o express-session para controle de login
import session from "express-session"; 
import { authRoutes } from "./routes/authRoutes";
import { tarefaRoutes } from "./routes/tarefaRoutes";

const app = express();

// Configuração de middlewares para ler dados de formulários e JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🎯 TODO 3: Configuração básica da sessão (ajuste o 'secret' para algo seguro)
app.use(
  session({
    secret: "meu_segredo_super_secreto", // Mude isso para uma string segura em produção
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 } // Sessão expira em 1 hora (em milissegundos)
  })
);

// Configuração do View Engine (EJS) e arquivos estáticos
app.set("view engine", "ejs");
app.set("views", "./src/views");
app.use(express.static("public"));

// 🌐 ROTA RAIZ (Resolve o erro "Cannot GET /")
// Redireciona o usuário direto para a tela de login ao acessar a URL base
app.get("/", (req, res) => {
  res.redirect("/login");
});

// Rotas da aplicação
app.use(authRoutes);
app.use(tarefaRoutes);

app.listen(3000, () => console.log("✅ App Tarefas rodando em http://localhost:3000"));