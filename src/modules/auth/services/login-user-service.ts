import { UnauthorizedError } from "@/errors/unauthorized-error"
import type { UsersRepository } from "@/modules/users/repositories/users-repository"
import type { JwtProvider } from "../providers/jwt-provider"

type Request = {
  email: string
  password: string
}

export class LoginUserService {
  constructor(
    private readonly repository: UsersRepository, 
    private readonly jwtProvider: JwtProvider) {}

  async execute({ email, password }: Request) {
    if (!email || !password) {
      throw new UnauthorizedError('Credenciais inválidas')
    }
    this.jwtProvider.generateToken()
    const user = await this.repository.findByEmail(email)
    if (!user) {
      throw new UnauthorizedError('Credenciais inválidas')
    }
  }
}
