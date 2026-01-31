import type { UsersRepository } from '../repositories/users-repository'
import type { User } from '@/modules/users/models/user'
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
  constructor(private readonly usersRepository: UsersRepository) { }

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

    if (phone !== undefined && phone !== null && phone !== '') {
      const digits = phone.replace(/\D/g, '')
      if (digits.length === 10) {
        const area = digits.substring(0, 2)
        const part1 = digits.substring(2, 6)
        const part2 = digits.substring(6)
        phone = `(${area}) ${part1}-${part2}`
      } else if (digits.length === 11) {
        const area = digits.substring(0, 2)
        const part1 = digits.substring(2, 7)
        const part2 = digits.substring(7)
        phone = `(${area}) ${part1}-${part2}`
      } else {
        throw new BadRequestError('Formato de telefone incorreto. Use: (XX) 9XXXX-XXXX ou (XX) XXXX-XXXX')
      }
    }

    if (birth_date) {
      const birthDate = new Date(birth_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (birthDate > today) {
        throw new BadRequestError('Data de nascimento inválida')
      }
    }

    const updateData: Partial<User> = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (phone) updateData.phone = phone
    if (location) updateData.location = location
    if (birth_date) updateData.birth_date = birth_date

    await this.usersRepository.update(userId, updateData)

    return true
  }
}
