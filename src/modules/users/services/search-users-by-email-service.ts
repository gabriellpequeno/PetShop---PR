import type { UsersRepository } from '../repositories/users-repository'
import { UnauthorizedError } from '@/errors/unauthorized-error'
import { BadRequestError } from '@/errors/bad-request-error'

type Request = {
  role: string
  email: string
}

export class SearchUsersByEmailService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({ role, email }: Request) {
    if (role !== 'admin') {
      throw new UnauthorizedError('Apenas administradores podem acessar esta funcionalidade')
    }

    if (!email || email.trim().length === 0) {
      throw new BadRequestError('Email de busca é obrigatório')
    }

    const users = await this.usersRepository.searchByEmail(email)

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
