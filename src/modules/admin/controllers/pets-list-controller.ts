import type { Request, Response } from 'express'
import { AdminRepository } from '../repositories/admin-repository'

export class PetsListController {
    static async handle(_request: Request, response: Response) {
        const repository = new AdminRepository()
        const pets = await repository.getPetsListWithNextService()
        return response.json(pets)
    }
}
