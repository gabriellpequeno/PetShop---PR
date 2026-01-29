import type { Request, Response } from 'express'
import { PetsRepository } from '@/modules/pets/repositories/pets-repository'
import { UnauthorizedError } from '@/errors/unauthorized-error'

export class GetUserPetsController {
  static async handle(request: Request, response: Response) {
    const role = request.user.role
    const { id } = request.params

    if (typeof id !== 'string') {
      throw new Error('User ID is required and must be a string')
    }

    if (role !== 'admin') {
      throw new UnauthorizedError('Apenas administradores podem acessar esta funcionalidade')
    }

    const petsRepository = new PetsRepository()
    const pets = await petsRepository.findByUserId(id)

    return response.json(pets)
  }
}
