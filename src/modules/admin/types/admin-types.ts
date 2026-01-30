export type DashboardPeriod = 'today' | 'week' | 'month'

export interface DashboardSummary {
    usersCount: number
    petsCount: number
    bookingsCount: number
    period: DashboardPeriod
}

export interface UserSummary {
    id: string
    name: string
    email: string
    petsCount: number
}

export interface DashboardCounts {
    usersCount: number
    petsCount: number
    bookingsCount: number
}
