import type { UsersRepository } from '../repositories/users-repository'
import { UnauthorizedError } from '@/errors/unauthorized-error'
import { NotFoundError } from '@/errors/not-found-error'
import { BadRequestError } from '@/errors/bad-request-error'

type Request = {
  role: string
  userId: string
  name?: string
  email?: string
  phone?: string
  location?: string
  birth_date?: string
}

export class AdminUpdateUserService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({ role, userId, name, email, phone, location, birth_date }: Request) {
    if (role !== 'admin') {
      throw new UnauthorizedError('Apenas administradores podem acessar esta funcionalidade')
    }

    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new NotFoundError('Usuário não encontrado')
    }

    if (email && email !== user.email) {
      const existingUser = await this.usersRepository.findByEmail(email)
      if (existingUser) {
        throw new BadRequestError('Este email já está em uso')
      }
    }

    await this.usersRepository.update(userId, {
      name,
      phone,
      location,
      birth_date,
    })

    return true
  }
}
