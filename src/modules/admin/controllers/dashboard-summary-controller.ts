import type { Request, Response } from 'express'
import { DashboardSummaryService } from '../services/dashboard-summary-service'

export class DashboardSummaryController {
    static async handle(request: Request, response: Response) {
        // Note: Using getTotals() because users/pets tables don't have created_at
        // For period filtering, those tables would need a created_at column
        const service = new DashboardSummaryService()
        const summary = await service.getTotals()

        return response.json(summary)
    }
}
