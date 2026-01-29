import type { UsersRepository } from '../repositories/users-repository'
import { UnauthorizedError } from '@/errors/unauthorized-error'
import { NotFoundError } from '@/errors/not-found-error'

type Request = {
  role: string
  userId: string
}

export class GetUserByIdService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({ role, userId }: Request) {
    if (role !== 'admin') {
      throw new UnauthorizedError('Apenas administradores podem acessar esta funcionalidade')
    }

    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new NotFoundError('Usuário não encontrado')
    }

    // Remove password from response
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      location: user.location,
      birth_date: user.birth_date,
    }
  }
}
