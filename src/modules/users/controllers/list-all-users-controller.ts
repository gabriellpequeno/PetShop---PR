import type { Request, Response } from 'express'
import { ListAllUsersService } from '../services/list-all-users-service'
import { UsersRepository } from '../repositories/users-repository'

export class ListAllUsersController {
  static async handle(request: Request, response: Response) {
    const role = request.user.role

    const usersRepository = new UsersRepository()
    const listAllUsersService = new ListAllUsersService(usersRepository)

    const users = await listAllUsersService.execute({ role })

    return response.json(users)
  }
}
