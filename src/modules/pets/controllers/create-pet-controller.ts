import type { Request, Response } from 'express'
import { CreatePetService } from '../services/create-pet-service'
import { PetsRepository } from '../repositories/pets-repository'

export class CreatePetController {
  static async handle(request: Request, response: Response) {
    const { name, species, breed, age, weight } = request.body
    
    const userId = request.user.id
    
    const repository = new PetsRepository()
    const service = new CreatePetService(repository)
    
    await service.execute({
      userId,
      name,
      species,
      breed,
      age,
      weight
    })
    
    return response.status(201).json({ message: 'Pet created successfully' })
  }
}
