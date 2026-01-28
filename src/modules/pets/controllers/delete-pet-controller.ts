import { PetsRepository } from "../repositories/pets-repository";
import { DeletePetService } from "../services/delete-pet-service";
import type { Request, Response } from "express";

export class DeletePetController {
  static async handle(request: Request, response: Response) {
    const id = request.params.id as string
    const userId = request.user.id
    const role = request.user.role

    const repository = new PetsRepository()
    const service = new DeletePetService(repository)

    await service.execute({ id, userId, role })

    return response.status(204).send()
  }
}
