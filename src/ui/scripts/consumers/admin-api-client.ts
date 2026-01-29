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
}

export type DashboardPeriod = 'today' | 'week' | 'month'

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

    async getUsersList(): Promise<UserListItem[]> {
        const response = await fetch(`${ApiConsumer.BASE_URL}/admin/users-list`, {
            method: 'GET',
            headers: this.getHeaders()
        })

        if (!response.ok) {
            throw new Error('Failed to fetch users list')
        }

        return response.json()
    }

    async getPetsList(): Promise<PetListItem[]> {
        const response = await fetch(`${ApiConsumer.BASE_URL}/admin/pets-list`, {
            method: 'GET',
            headers: this.getHeaders()
        })

        if (!response.ok) {
            throw new Error('Failed to fetch pets list')
        }

        return response.json()
    }

    async getBookingsList(): Promise<BookingListItem[]> {
        const response = await fetch(`${ApiConsumer.BASE_URL}/admin/bookings-list`, {
            method: 'GET',
            headers: this.getHeaders()
        })

        if (!response.ok) {
            throw new Error('Failed to fetch bookings list')
        }

        return response.json()
    }
}
