import type { Request, Response } from 'express'
import { LoginUserService } from '../services/login-user-service'
import { JwtProvider } from '../providers/jwt-provider'
import { UsersRepository } from '@/modules/users/repositories/users-repository'

export class LoginUserController {
  static async handle(request: Request, response: Response) {
    const { email, password } = request.body

    const repository = new UsersRepository()
    const jwtProvider = new JwtProvider()
    const service = new LoginUserService(repository, jwtProvider)
    await service.execute({ email, password })

    return response.json({ message: 'Login feito com sucesso' })
  }
}
