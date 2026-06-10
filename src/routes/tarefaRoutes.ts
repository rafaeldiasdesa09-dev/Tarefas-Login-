import { Router } from "express";
import * as tarefaModel from "../models/tarefaModel";

const router = Router();

// Middleware para verificar login
function requerAutenticacao(req: any, res: any, next: any) {
  if (req.session?.usuario) {
    return next();
  }

  res.redirect("/login");
}

// GET /tarefas
router.get(
  "/tarefas",
  requerAutenticacao,
  async (req: any, res: any): Promise<void> => {
    try {
      const usuario = req.session.usuario;
      const tarefas = await tarefaModel.listarPorUsuario(usuario.id);

      res.render("tarefas", {
        nome: usuario.nome,
        tarefas,
        flash: null,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Erro ao carregar tarefas.");
    }
  }
);

// POST /tarefas
router.post(
  "/tarefas",
  requerAutenticacao,
  async (req: any, res: any): Promise<void> => {
    try {
      const { texto } = req.body;
      const usuario = req.session.usuario;

      if (texto && texto.trim() !== "") {
        await tarefaModel.adicionar(usuario.id, texto.trim());
      }

      res.redirect("/tarefas");
    } catch (error) {
      console.error(error);
      res.redirect("/tarefas");
    }
  }
);

// POST /tarefas/:id/concluir
router.post(
  "/tarefas/:id/concluir",
  requerAutenticacao,
  async (req: any, res: any): Promise<void> => {
    try {
      const idTarefa = Number(req.params.id);

      await tarefaModel.concluir(
        idTarefa,
        req.session.usuario.id
      );

      res.redirect("/tarefas");
    } catch (error) {
      console.error(error);
      res.redirect("/tarefas");
    }
  }
);

// POST /tarefas/:id/remover
router.post(
  "/tarefas/:id/remover",
  requerAutenticacao,
  async (req: any, res: any): Promise<void> => {
    try {
      const idTarefa = Number(req.params.id);

      await tarefaModel.remover(
        idTarefa,
        req.session.usuario.id
      );

      res.redirect("/tarefas");
    } catch (error) {
      console.error(error);
      res.redirect("/tarefas");
    }
  }
);

export { router as tarefaRoutes };