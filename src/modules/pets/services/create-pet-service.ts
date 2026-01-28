import { AppError } from "@/errors/app-error"
import type { PetsRepository } from "../repositories/pets-repository"

type Request = {
  userId: string
  name: string
  species: string
  breed: string
  age: number
  weight: number
}

export class CreatePetService {
  constructor(private readonly petsRepository: PetsRepository) {}

  async execute({ userId, name, species, breed, age, weight }: Request) {
    if (!name || !species || !breed || !age || !weight) {
      throw new AppError('Validation Error', 'All fields are required', 400)
    }

    await this.petsRepository.add({
      user_id: userId,
      name,
      species,
      breed,
      age,
      weight
    })
  }
}
