import { Router } from "express";
import * as userModel from "../models/userModel";

const router = Router();

// GET /login
router.get("/login", (req: any, res: any) => {
  if (req.session.usuario) {
    return res.redirect("/tarefas");
  }

  res.render("login", { flash: null });
});

// POST /login
router.post("/login", async (req: any, res: any) => {
  const { email, senha } = req.body;

  const usuario = await userModel.login(email, senha);

  if (usuario) {
    req.session.usuario = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    };

    return res.redirect("/tarefas");
  }

  res.render("login", {
    flash: "E-mail ou senha incorretos.",
  });
});

// GET /registro
router.get("/registro", (req: any, res: any) => {
  res.render("registro", { flash: null });
});

// GET /registros
router.get("/registros", (req: any, res: any) => {
  res.render("registros");
});

// POST /registro
router.post("/registro", async (req: any, res: any) => {
  const { nome, email, senha } = req.body;

  try {
    await userModel.registrar(nome, email, senha);

    // Redireciona para registros.ejs
    return res.redirect("/registros");
  } catch (error: any) {
    res.render("registro", {
      flash: error.message || "Erro ao registrar usuário.",
    });
  }
});

// GET /logout
router.get("/logout", (req: any, res: any) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

export { router as authRoutes };