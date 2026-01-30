import type { Request, Response } from 'express'
import { AdminPetsRepository } from '../repositories/admin-pets-repository'
import { PetsRepository } from '@/modules/pets/repositories/pets-repository'
import { NotFoundError } from '@/errors/not-found-error'
import { BadRequestError } from '@/errors/bad-request-error'

const adminPetsRepository = new AdminPetsRepository()
const petsRepository = new PetsRepository()

export class AdminPetsController {
  static async list(request: Request, response: Response) {
    const { search, userId } = request.query

    const searchStr = typeof search === 'string' ? search : undefined
    const userIdStr = typeof userId === 'string' ? userId : undefined

    const pets = await adminPetsRepository.getAllPetsWithOwner({
      search: searchStr,
      userId: userIdStr
    })

    return response.json(pets)
  }

  static async getUsers(_request: Request, response: Response) {
    const users = await adminPetsRepository.getAllUsers()
    return response.json(users)
  }

  static async update(request: Request, response: Response) {
    const id = request.params.id as string
    const { name, species, breed, age, weight } = request.body

    if (!id) {
      throw new BadRequestError('ID do pet é obrigatório')
    }

    const existingPet = await petsRepository.findById(id)
    if (!existingPet) {
      throw new NotFoundError('Pet não encontrado')
    }

    await petsRepository.update({
      id,
      userId: existingPet.userId,
      name: name ?? existingPet.name,
      species: species ?? existingPet.species,
      breed: breed ?? existingPet.breed,
      age: age ?? existingPet.age,
      weight: weight ?? existingPet.weight
    })

    return response.json({ message: 'Pet atualizado com sucesso' })
  }

  static async delete(request: Request, response: Response) {
    const id = request.params.id as string

    if (!id) {
      throw new BadRequestError('ID do pet é obrigatório')
    }

    const existingPet = await petsRepository.findById(id)
    if (!existingPet) {
      throw new NotFoundError('Pet não encontrado')
    }

    await petsRepository.delete(id)

    return response.json({ message: 'Pet excluído com sucesso' })
  }
}
