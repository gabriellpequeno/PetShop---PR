import type { Request, Response } from 'express'
import { GetUserByIdService } from '../services/get-user-by-id-service'
import { UsersRepository } from '../repositories/users-repository'

export class GetUserByIdController {
  static async handle(request: Request, response: Response) {
    const role = request.user.role
    const { id } = request.params

    const usersRepository = new UsersRepository()
    const getUserByIdService = new GetUserByIdService(usersRepository)

    const user = await getUserByIdService.execute({ role, userId: id })

    return response.json(user)
  }
}
