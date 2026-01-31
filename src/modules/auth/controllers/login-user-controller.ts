import type { Request, Response } from 'express'
import { LoginUserService } from '../services/login-user-service'
import { JwtProvider } from '../providers/jwt-provider'
import { CryptoProvider } from '../providers/crypto-provider'
import { UsersRepository } from '@/modules/users/repositories/users-repository'

export class LoginUserController {
  static async handle(request: Request, response: Response) {
    const { email, password } = request.body

    const repository = new UsersRepository()
    const jwtProvider = new JwtProvider()
    const cryptoProvider = new CryptoProvider()
    const service = new LoginUserService(repository, jwtProvider, cryptoProvider)
    const { token, user } = await service.execute({ email, password })

    response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      path: '/',
      sameSite: 'lax'
    })

    return response.json({ token, user })

  }
}

