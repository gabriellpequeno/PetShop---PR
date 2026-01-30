import { PetsRepository } from "../repositories/pets-repository";
import { UpdatePetService } from "../services/update-pet-service";
import type { Request, Response } from "express";

export class UpdatePetController {
  static async handle(request: Request, response: Response) {
    const id = request.params.id as string
    const { name, species, breed, age, weight, size } = request.body
    const userId = request.user.id
    const role = request.user.role

    const repository = new PetsRepository()
    const service = new UpdatePetService(repository)

    await service.execute({
      id,
      userId,
      role,
      name,
      species,
      breed,
      age,
      weight,
      size
    })

    return response.status(204).send()
  }
}
