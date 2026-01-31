import type { Request, Response } from 'express'
import { AdminRepository } from '../repositories/admin-repository'

export class UsersListController {
    static async handle(request: Request, response: Response) {
        const hasService = (request.query.hasService as 'all' | 'with_service') || 'all'
        const repository = new AdminRepository()
        const users = await repository.getUsersListWithNextService(hasService)
        return response.json(users)
    }
}
