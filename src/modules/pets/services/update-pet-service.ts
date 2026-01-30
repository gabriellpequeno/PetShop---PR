import { AppError } from "@/errors/app-error";
import type { PetsRepository } from "../repositories/pets-repository";
import type { PetSize } from "../models/pet";

type Request = {
  id: string
  userId: string
  role: string
  name: string
  species: string
  breed: string
  age: number
  weight: number
  size: PetSize
}

export class UpdatePetService {
  constructor(private readonly petsRepository: PetsRepository) {}

  async execute({ id, userId, role, name, species, breed, age, weight, size }: Request) {
    const pet = await this.petsRepository.findById(id)

    if (!pet) {
      throw new AppError('Pet not found', 'Pet not found', 404)
    }

    if (role !== 'admin' && pet.userId !== userId) {
      throw new AppError('Forbidden', 'You are not allowed to update this pet', 403)
    }

    const validSizes: PetSize[] = ['P', 'M', 'G']
    if (size && !validSizes.includes(size)) {
      throw new AppError('Validation Error', 'Size must be P, M or G', 400)
    }

    pet.name = name
    pet.species = species
    pet.breed = breed
    pet.age = age
    pet.weight = weight
    pet.size = size || pet.size

    await this.petsRepository.update(pet)
  }
}
