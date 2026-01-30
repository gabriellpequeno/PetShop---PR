import type { Request, Response } from 'express'
import { DashboardSummaryService } from '../services/dashboard-summary-service'

export class DashboardSummaryController {
    static async handle(request: Request, response: Response) {
        const service = new DashboardSummaryService()
        const summary = await service.getTotals()

        return response.json(summary)
    }
}
