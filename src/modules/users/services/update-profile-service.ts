import { UsersRepository } from '../repositories/users-repository'
import { AppError } from '@/errors/app-error'

type UpdateProfileRequest = {
  userId: string
  name?: string
  phone?: string
  location?: string
  birth_date?: string
}

export class UpdateProfileService {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ userId, name, phone, location, birth_date }: UpdateProfileRequest) {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new AppError('User not found', 'User not found in database', 404)
    }

    const dataToUpdate: any = {
      phone: phone ?? null,
      location: location ?? null,
      birth_date: birth_date ?? null,
    }

    if (name) {
      dataToUpdate.name = name
    }

    await this.usersRepository.update(userId, dataToUpdate)
  }

  async getProfile(userId: string) {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new AppError('User not found', 'User not found in database', 404)
    }

    // Omit password from response
    const { password, ...userProfile } = user
    return userProfile
  }
}
