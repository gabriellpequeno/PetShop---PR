import type { Request, Response } from 'express'
import { DeleteUserService } from '../services/delete-user-service'
import { UsersRepository } from '../repositories/users-repository'

export class DeleteUserController {
  static async handle(request: Request, response: Response) {
    const role = request.user.role
    const { id } = request.params

    const usersRepository = new UsersRepository()
    const deleteUserService = new DeleteUserService(usersRepository)

    await deleteUserService.execute({ role, userId: id })

    return response.status(204).send()
  }
}
