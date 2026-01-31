import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UsersSummaryService } from '../services/users-summary-service'
import { AdminRepository } from '../repositories/admin-repository'
import type { UserSummary } from '../types/admin-types'

vi.mock('../repositories/admin-repository')

describe('UsersSummaryService', () => {
    let service: UsersSummaryService
    let mockRepository: AdminRepository

    beforeEach(() => {
        mockRepository = new AdminRepository()
        service = new UsersSummaryService(mockRepository)
    })

    describe('execute', () => {
        it('should return users with pets count', async () => {
            const mockUsers: UserSummary[] = [
                { id: '1', name: 'João Silva', email: 'joao@email.com', petsCount: 2 },
                { id: '2', name: 'Maria Santos', email: 'maria@email.com', petsCount: 1 },
                { id: '3', name: 'Pedro Oliveira', email: 'pedro@email.com', petsCount: 0 }
            ]

            vi.spyOn(mockRepository, 'getUsersWithPetsCount').mockResolvedValue(mockUsers)

            const result = await service.execute()

            expect(result).toEqual(mockUsers)
            expect(result).toHaveLength(3)
            expect(mockRepository.getUsersWithPetsCount).toHaveBeenCalled()
        })

        it('should return empty array when no users exist', async () => {
            vi.spyOn(mockRepository, 'getUsersWithPetsCount').mockResolvedValue([])

            const result = await service.execute()

            expect(result).toEqual([])
            expect(result).toHaveLength(0)
        })

        it('should return users ordered by name', async () => {
            const mockUsers: UserSummary[] = [
                { id: '1', name: 'Ana Beatriz', email: 'ana@email.com', petsCount: 3 },
                { id: '2', name: 'Bruno Costa', email: 'bruno@email.com', petsCount: 1 }
            ]

            vi.spyOn(mockRepository, 'getUsersWithPetsCount').mockResolvedValue(mockUsers)

            const result = await service.execute()

            expect(result[0]?.name).toBe('Ana Beatriz')
            expect(result[1]?.name).toBe('Bruno Costa')
        })
    })
})
