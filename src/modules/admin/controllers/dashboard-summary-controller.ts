import type { Request, Response } from 'express'
import { DashboardSummaryService } from '../services/dashboard-summary-service'
import type { DashboardPeriod } from '../types/admin-types'

export class DashboardSummaryController {
    static async handle(request: Request, response: Response) {
        const service = new DashboardSummaryService()
        const range = request.query.range as DashboardPeriod | undefined
        
        // Note: Currently period filtering only works for bookings
        // Users and pets counts are always total due to missing created_at field
        const summary = range ? await service.execute(range) : await service.getTotals()

        return response.json(summary)
    }
}
