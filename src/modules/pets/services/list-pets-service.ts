import type { PetsRepository } from "../repositories/pets-repository"

type Request = {
  userId: string
  role: string
}

export class ListPetsService {
  constructor(private readonly petsRepository: PetsRepository) {}

  async execute({ userId, role }: Request) {
    if (role === 'admin') {
      return await this.petsRepository.findAll()
    }

    const pets = await this.petsRepository.findByUserId(userId)
    return pets
  }
}
