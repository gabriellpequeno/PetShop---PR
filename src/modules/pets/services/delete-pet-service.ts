import { AppError } from "@/errors/app-error";
import type { PetsRepository } from "../repositories/pets-repository";

type Request = {
  id: string
  userId: string
  role: string
}

export class DeletePetService {
  constructor(private readonly petsRepository: PetsRepository) {}

  async execute({ id, userId, role }: Request) {
    const pet = await this.petsRepository.findById(id)

    if (!pet) {
      throw new AppError('Pet not found', 'Pet not found', 404)
    }

    if (role !== 'admin' && pet.user_id !== userId) {
      throw new AppError('Forbidden', 'You are not allowed to delete this pet', 403)
    }

    await this.petsRepository.delete(id)
  }
}
