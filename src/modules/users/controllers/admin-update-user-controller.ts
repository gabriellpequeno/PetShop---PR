import type { Request, Response } from 'express'
import { AdminUpdateUserService } from '../services/admin-update-user-service'
import { UsersRepository } from '../repositories/users-repository'

export class AdminUpdateUserController {
  static async handle(request: Request, response: Response) {
    const role = request.user.role
    const { id } = request.params
    const { name, email, phone, location, birth_date } = request.body

    const usersRepository = new UsersRepository()
    const adminUpdateUserService = new AdminUpdateUserService(usersRepository)

    await adminUpdateUserService.execute({
      role,
      userId: id,
      name,
      email,
      phone,
      location,
      birth_date,
    })

    return response.status(204).send()
  }
}
