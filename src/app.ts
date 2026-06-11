import express from "express";
import path from "path";
import session from "express-session";

import { authRoutes } from "./routes/authRoutes";
import { tarefaRoutes } from "./routes/tarefaRoutes";

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessão
app.use(
  session({
    secret: "senha_secreta",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 // 1 hora
    }
  })
);

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Arquivos estáticos
app.use(express.static(path.join(__dirname, "../public")));

// Página inicial
app.get("/", (req, res) => {
  res.redirect("/login");
});

// Rotas
app.use(authRoutes);
app.use(tarefaRoutes);

// Inicialização do servidor
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`✅ App Tarefas rodando em http://localhost:${PORT}`);
});