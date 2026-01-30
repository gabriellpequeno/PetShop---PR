import type { Request, Response } from 'express'
import { SearchUsersByEmailService } from '../services/search-users-by-email-service'
import { UsersRepository } from '../repositories/users-repository'

export class SearchUsersByEmailController {
  static async handle(request: Request, response: Response) {
    const role = request.user.role
    const { email } = request.query

    const usersRepository = new UsersRepository()
    const searchUsersService = new SearchUsersByEmailService(usersRepository)

    const users = await searchUsersService.execute({
      role,
      email: email as string
    })

    return response.json(users)
  }
}
