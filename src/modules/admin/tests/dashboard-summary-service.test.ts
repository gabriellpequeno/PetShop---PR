import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DashboardSummaryService } from '../services/dashboard-summary-service'
import { AdminRepository } from '../repositories/admin-repository'
import type { DashboardCounts } from '../types/admin-types'

vi.mock('../repositories/admin-repository')

describe('DashboardSummaryService', () => {
    let service: DashboardSummaryService
    let mockRepository: AdminRepository

    beforeEach(() => {
        mockRepository = new AdminRepository()
        service = new DashboardSummaryService(mockRepository)
    })

    describe('execute', () => {
        it('should return dashboard summary with counts for today period', async () => {
            const mockCounts: DashboardCounts = {
                usersCount: 5,
                petsCount: 10,
                bookingsCount: 3
            }

            vi.spyOn(mockRepository, 'getDashboardCounts').mockResolvedValue(mockCounts)

            const result = await service.execute('today')

            expect(result).toEqual({
                usersCount: 5,
                petsCount: 10,
                bookingsCount: 3,
                period: 'today'
            })
            expect(mockRepository.getDashboardCounts).toHaveBeenCalled()
        })

        it('should return dashboard summary with counts for week period', async () => {
            const mockCounts: DashboardCounts = {
                usersCount: 15,
                petsCount: 25,
                bookingsCount: 8
            }

            vi.spyOn(mockRepository, 'getDashboardCounts').mockResolvedValue(mockCounts)

            const result = await service.execute('week')

            expect(result).toEqual({
                usersCount: 15,
                petsCount: 25,
                bookingsCount: 8,
                period: 'week'
            })
        })

        it('should return dashboard summary with counts for month period', async () => {
            const mockCounts: DashboardCounts = {
                usersCount: 50,
                petsCount: 100,
                bookingsCount: 30
            }

            vi.spyOn(mockRepository, 'getDashboardCounts').mockResolvedValue(mockCounts)

            const result = await service.execute('month')

            expect(result).toEqual({
                usersCount: 50,
                petsCount: 100,
                bookingsCount: 30,
                period: 'month'
            })
        })
    })

    describe('getTotals', () => {
        it('should return total counts without date filter', async () => {
            const mockCounts: DashboardCounts = {
                usersCount: 100,
                petsCount: 200,
                bookingsCount: 50
            }

            vi.spyOn(mockRepository, 'getTotalCounts').mockResolvedValue(mockCounts)

            const result = await service.getTotals()

            expect(result).toEqual({
                usersCount: 100,
                petsCount: 200,
                bookingsCount: 50,
                period: 'month'
            })
            expect(mockRepository.getTotalCounts).toHaveBeenCalled()
        })
    })
})
