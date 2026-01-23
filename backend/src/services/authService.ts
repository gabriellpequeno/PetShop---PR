import jwt from "jsonwebtoken";
import userRepository from "../repositories/userRepository.js";
import { validateEmail, validatePassword } from "../utils/validators.js";
import type { IUser } from "../types/User.js";

class AuthService {
  async register(userData: IUser) {
    if (!validateEmail(userData.email)) throw new Error("E-mail inválido");
    if (!validatePassword(userData.password))
      throw new Error("Senha fraca (mínimo 8 caracteres e uma letra maiuscula)");

    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) throw new Error("E-mail já cadastrado");

    return await userRepository.save(userData);
  }

  async login(email: string, pass: string) {
    const user = await userRepository.findByEmail(email);
    if (!user || user.password !== pass) {
      throw new Error("Credenciais inválidas");
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) throw new Error("JWT secret not configured");

    const token = jwt.sign({ id: user.id, role: user.role }, secret, {
      expiresIn: "1h",
    });

    return { token, user: { name: user.name, role: user.role } };
  }
}

export default new AuthService();
