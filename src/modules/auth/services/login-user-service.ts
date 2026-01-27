import { UnauthorizedError } from "@/errors/unauthorized-error"
import type { UsersRepository } from "@/modules/users/repositories/users-repository"
import type { JwtProvider } from "../providers/jwt-provider"
import type { CryptoProvider } from "../providers/crypto-provider"

type Request = {
  email: string
  password: string
}

export class LoginUserService {
  constructor(
    private readonly repository: UsersRepository, 
    private readonly jwtProvider: JwtProvider,
    private readonly cryptoProvider: CryptoProvider
  ) {}

  async execute({ email, password }: Request) {
    if (!email || !password) {
      throw new UnauthorizedError('Credenciais inválidas')
    }

    const user = await this.repository.findByEmail(email)
    
    if (!user) {
      throw new UnauthorizedError('Credenciais inválidas')
    }

    const passwordMatch = await this.cryptoProvider.compare(password, user.password)

    if (!passwordMatch) {
      throw new UnauthorizedError('Credenciais inválidas')
    }

    const token = this.jwtProvider.generateToken({
      sub: user.id,
      role: user.role
    })

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  }
}

