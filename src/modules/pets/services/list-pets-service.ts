import type { PetsRepository } from "../repositories/pets-repository"

type Request = {
  userId: string
}

export class ListPetsService {
  constructor(private readonly petsRepository: PetsRepository) {}

  async execute({ userId }: Request) {
    const pets = await this.petsRepository.findByUserId(userId)
    return pets
  }
}
