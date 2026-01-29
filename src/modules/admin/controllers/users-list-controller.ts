import type { Request, Response } from 'express'
import { AdminRepository } from '../repositories/admin-repository'

export class UsersListController {
    static async handle(_request: Request, response: Response) {
        const repository = new AdminRepository()
        const users = await repository.getUsersListWithNextService()
        return response.json(users)
    }
}
