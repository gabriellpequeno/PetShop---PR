import { Request, Response } from "express";
import authService from "../services/authService.js";

class AuthController {
  public async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      const loginData = await authService.login(
        email,
        password,
      );

      return res.status(200).json(loginData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro interno no servidor.";
      return res.status(401).json({ error: errorMessage });
    }
  }

  public async register(req: Request, res: Response): Promise<Response> {
    try {
      const userData = req.body;

      await authService.register(userData);

      return res
        .status(201)
        .json({ message: "Usuário cadastrado com sucesso!" });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao realizar cadastro.";
      return res.status(400).json({ error: errorMessage });
    }
  }
}

export default new AuthController();
