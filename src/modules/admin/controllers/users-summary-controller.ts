import type { Request, Response } from 'express'
import { UsersSummaryService } from '../services/users-summary-service'

export class UsersSummaryController {
    static async handle(_request: Request, response: Response) {
        const service = new UsersSummaryService()
        const users = await service.execute()

        return response.json(users)
    }
}
