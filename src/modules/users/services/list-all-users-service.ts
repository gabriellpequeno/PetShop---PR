import type { UsersRepository } from '../repositories/users-repository'
import { UnauthorizedError } from '@/errors/unauthorized-error'

type Request = {
  role: string
}

export class ListAllUsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({ role }: Request) {
    if (role !== 'admin') {
      throw new UnauthorizedError('Apenas administradores podem acessar esta funcionalidade')
    }

    const users = await this.usersRepository.findAll()

    // Remove password from response
    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      location: user.location,
      birth_date: user.birth_date,
    }))
  }
}
