import { AppError } from "@/errors/app-error"
import type { PetsRepository } from "../repositories/pets-repository"
import type { PetSize } from "../models/pet"

type Request = {
  userId: string
  name: string
  species: string
  breed: string
  age: number
  weight: number
  size: PetSize
}

export class CreatePetService {
  constructor(private readonly petsRepository: PetsRepository) {}

  async execute({ userId, name, species, breed, age, weight, size }: Request) {
    if (!name || !species || !breed || !age || !weight || !size) {
      throw new AppError('Validation Error', 'All fields are required', 400)
    }

    const validSizes: PetSize[] = ['P', 'M', 'G']
    if (!validSizes.includes(size)) {
      throw new AppError('Validation Error', 'Size must be P, M or G', 400)
    }

    await this.petsRepository.add({
      userId: userId,
      name,
      species,
      breed,
      age,
      weight,
      size
    })
  }
}
