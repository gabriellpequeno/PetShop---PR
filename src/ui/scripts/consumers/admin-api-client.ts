import { ApiConsumer } from './api-consumer'

export interface DashboardSummary {
    usersCount: number
    petsCount: number
    bookingsCount: number
    period: 'today' | 'week' | 'month'
}

export interface UserSummary {
    id: string
    name: string
    email: string
    petsCount: number
}

export interface UserListItem {
    id: string
    name: string
    nextService: string | null
    nextServiceTime: string | null
    nextPetName: string | null
    nextPetSpecies: string | null
    petsCount: number
}

export interface PetListItem {
    id: string
    name: string
    nextService: string | null
    nextServiceTime: string | null
    tutorName: string
}

export interface BookingListItem {
    id: string
    serviceName: string
    petName: string
    tutorName: string
    bookingDate: string
    status: string
}

export type DashboardPeriod = 'today' | 'week' | 'month'

export interface AdminPet {
    id: string
    name: string
    species: string
    breed: string | null
    age: number | null
    weight: number | null
    size: 'P' | 'M' | 'G'
    userId: string
    ownerName: string
    ownerEmail: string
}

export interface AdminPetUser {
    id: string
    name: string
    email: string
}

export class AdminApiClient extends ApiConsumer {
    async getDashboardSummary(range: DashboardPeriod = 'month'): Promise<DashboardSummary> {
        const response = await fetch(`${ApiConsumer.BASE_URL}/admin/dashboard-summary?range=${range}`, {
            method: 'GET',
            headers: this.getHeaders()
        })

        if (!response.ok) {
            throw new Error('Failed to fetch dashboard summary')
        }

        return response.json()
    }

    async getUsersSummary(): Promise<UserSummary[]> {
        const response = await fetch(`${ApiConsumer.BASE_URL}/admin/users-summary`, {
            method: 'GET',
            headers: this.getHeaders()
        })

        if (!response.ok) {
            throw new Error('Failed to fetch users summary')
        }

        return response.json()
    }

    async getUsersList(hasService: 'all' | 'with_service' = 'all'): Promise<UserListItem[]> {
        const response = await fetch(`${ApiConsumer.BASE_URL}/admin/users-list?hasService=${hasService}`, {
            method: 'GET',
            headers: this.getHeaders()
        })

        if (!response.ok) {
            throw new Error('Failed to fetch users list')
        }

        return response.json()
    }

    async getPetsList(hasService: 'all' | 'with_service' = 'all'): Promise<PetListItem[]> {
        const response = await fetch(`${ApiConsumer.BASE_URL}/admin/pets-list?hasService=${hasService}`, {
            method: 'GET',
            headers: this.getHeaders()
        })

        if (!response.ok) {
            throw new Error('Failed to fetch pets list')
        }

        return response.json()
    }

    async getBookingsList(filter: 'upcoming' | 'completed' = 'upcoming', status: 'all' | 'active' | 'cancelled' = 'all'): Promise<BookingListItem[]> {
        const response = await fetch(`${ApiConsumer.BASE_URL}/admin/bookings-list?filter=${filter}&status=${status}`, {
            method: 'GET',
            headers: this.getHeaders()
        })

        if (!response.ok) {
            throw new Error('Failed to fetch bookings list')
        }

        return response.json()
    }

    async getAdminPets(params?: Record<string, string>): Promise<AdminPet[]> {
        const qs = params ? new URLSearchParams(params).toString() : ''
        const url = `${ApiConsumer.BASE_URL}/admin/pets${qs ? `?${qs}` : ''}`
        const response = await fetch(url, {
            method: 'GET',
            headers: this.getHeaders(),
            credentials: 'include',
        })

        if (!response.ok) {
            throw new Error('Failed to fetch admin pets')
        }

        return response.json()
    }

    async getPetsUsers(): Promise<AdminPetUser[]> {
        const response = await fetch(`${ApiConsumer.BASE_URL}/admin/pets/users`, {
            method: 'GET',
            headers: this.getHeaders(),
            credentials: 'include',
        })

        if (!response.ok) {
            throw new Error('Failed to fetch users for admin pets')
        }

        return response.json()
    }

    async updatePet(id: string, data: Partial<AdminPet>): Promise<AdminPet> {
        const response = await fetch(`${ApiConsumer.BASE_URL}/admin/pets/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            credentials: 'include',
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.message || 'Failed to update pet')
        }

        return response.json()
    }

    async deletePet(id: string): Promise<void> {
        const response = await fetch(`${ApiConsumer.BASE_URL}/admin/pets/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
            credentials: 'include',
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.message || 'Failed to delete pet')
        }
    }
}
