import type { Request, Response } from 'express'
import { ListPetsService } from '../services/list-pets-service'
import { PetsRepository } from '../repositories/pets-repository'

export class ListPetsController {
  static async handle(request: Request, response: Response) {
    const userId = request.user.id

    const repository = new PetsRepository()
    const service = new ListPetsService(repository)

    const pets = await service.execute({ userId })

    return response.json(pets)
  }
}
