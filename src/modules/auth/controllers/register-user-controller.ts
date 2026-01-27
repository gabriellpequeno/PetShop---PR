import type { Request, Response } from 'express'
import { RegisterUserService } from '../services/register-user-service'
import { CryptoProvider } from '../providers/crypto-provider'
import { UsersRepository } from '@/modules/users/repositories/users-repository'

export class RegisterUserController {
  static async handle(request: Request, response: Response) {
    const { name, email, password } = request.body

    const repository = new UsersRepository()
    const cryptoProvider = new CryptoProvider()
    const service = new RegisterUserService(repository, cryptoProvider)
    const user = await service.execute({ name, email, password })

    return response.status(201).json(user)
  }
}

