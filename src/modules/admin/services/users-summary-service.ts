import type { UserSummary } from '../types/admin-types'
import { AdminRepository } from '../repositories/admin-repository'

export class UsersSummaryService {
    private adminRepository: AdminRepository

    constructor(adminRepository?: AdminRepository) {
        this.adminRepository = adminRepository ?? new AdminRepository()
    }

    async execute(): Promise<UserSummary[]> {
        return await this.adminRepository.getUsersWithPetsCount()
    }
}
