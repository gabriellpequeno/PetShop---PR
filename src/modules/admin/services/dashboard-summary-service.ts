import type { DashboardPeriod, DashboardSummary } from '../types/admin-types'
import { AdminRepository } from '../repositories/admin-repository'

export class DashboardSummaryService {
    private adminRepository: AdminRepository

    constructor(adminRepository?: AdminRepository) {
        this.adminRepository = adminRepository ?? new AdminRepository()
    }

    private getDateRange(period: DashboardPeriod): { startDate: string; endDate: string } {
        const now = new Date()
        const endDate = now.toISOString()
        let startDate: Date

        switch (period) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                break
            case 'week':
                startDate = new Date(now)
                startDate.setDate(now.getDate() - 7)
                break
            case 'month':
                startDate = new Date(now)
                startDate.setMonth(now.getMonth() - 1)
                break
            default:
                startDate = new Date(0)
        }

        return { startDate: startDate.toISOString(), endDate }
    }

    async execute(period: DashboardPeriod): Promise<DashboardSummary> {
        const { startDate, endDate } = this.getDateRange(period)
        const counts = await this.adminRepository.getDashboardCounts(startDate, endDate)

        return {
            ...counts,
            period
        }
    }

    async getTotals(): Promise<DashboardSummary> {
        const counts = await this.adminRepository.getTotalCounts()
        return {
            ...counts,
            period: 'month'
        }
    }
}
