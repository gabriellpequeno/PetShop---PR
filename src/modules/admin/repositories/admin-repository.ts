import { db } from '@/database/db'
import type { DashboardCounts, UserSummary } from '../types/admin-types'

export class AdminRepository {
    async countUsersByPeriod(startDate: string, endDate: string): Promise<number> {
        const result = await db.get<{ count: number }>(
            `SELECT COUNT(*) as count FROM users 
       WHERE datetime(created_at) >= datetime(?) 
       AND datetime(created_at) <= datetime(?)`,
            [startDate, endDate]
        )
        return result?.count ?? 0
    }

    async countPetsByPeriod(startDate: string, endDate: string): Promise<number> {
        const result = await db.get<{ count: number }>(
            `SELECT COUNT(*) as count FROM pets 
       WHERE datetime(created_at) >= datetime(?) 
       AND datetime(created_at) <= datetime(?)`,
            [startDate, endDate]
        )
        return result?.count ?? 0
    }

    async countBookingsByPeriod(startDate: string, endDate: string): Promise<number> {
        const result = await db.get<{ count: number }>(
            `SELECT COUNT(*) as count FROM bookings 
       WHERE datetime(createdAt) >= datetime(?) 
       AND datetime(createdAt) <= datetime(?)`,
            [startDate, endDate]
        )
        return result?.count ?? 0
    }

    async getDashboardCounts(startDate: string, endDate: string): Promise<DashboardCounts> {
        const [usersCount, petsCount, bookingsCount] = await Promise.all([
            this.countUsersByPeriod(startDate, endDate),
            this.countPetsByPeriod(startDate, endDate),
            this.countBookingsByPeriod(startDate, endDate)
        ])

        return { usersCount, petsCount, bookingsCount }
    }

    async getTotalCounts(): Promise<DashboardCounts> {
        const [usersResult, petsResult, bookingsResult] = await Promise.all([
            db.get<{ count: number }>('SELECT COUNT(*) as count FROM users'),
            db.get<{ count: number }>('SELECT COUNT(*) as count FROM pets'),
            db.get<{ count: number }>('SELECT COUNT(*) as count FROM bookings')
        ])

        return {
            usersCount: usersResult?.count ?? 0,
            petsCount: petsResult?.count ?? 0,
            bookingsCount: bookingsResult?.count ?? 0
        }
    }

    async getUsersWithPetsCount(): Promise<UserSummary[]> {
        const users = await db.all<UserSummary[]>(
            `SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(p.id) as petsCount
      FROM users u
      LEFT JOIN pets p ON u.id = p.userId
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY u.name ASC`
        )
        return users
    }

    // New methods for interactive dashboard cards

    async getUsersListWithNextService(): Promise<Array<{
        id: string
        name: string
        nextService: string | null
        nextServiceTime: string | null
        petsCount: number
    }>> {
        const now = new Date().toISOString()
        const users = await db.all<Array<{
            id: string
            name: string
            nextService: string | null
            nextServiceTime: string | null
            petsCount: number
        }>>(`
            SELECT 
                u.id,
                u.name,
                j.name as nextService,
                b.bookingDate as nextServiceTime,
                (SELECT COUNT(*) FROM pets WHERE userId = u.id) as petsCount
            FROM users u
            LEFT JOIN (
                SELECT userId, jobId, bookingDate
                FROM bookings
                WHERE bookingDate >= ?
                AND status != 'cancelado'
                ORDER BY bookingDate ASC
            ) b ON u.id = b.userId
            LEFT JOIN jobs j ON b.jobId = j.id
            WHERE u.role = 'customer'
            GROUP BY u.id
            ORDER BY 
                CASE WHEN b.bookingDate IS NULL THEN 1 ELSE 0 END,
                b.bookingDate ASC,
                u.name ASC
        `, [now])
        return users
    }

    async getPetsListWithNextService(): Promise<Array<{
        id: string
        name: string
        nextService: string | null
        nextServiceTime: string | null
        tutorName: string
    }>> {
        const now = new Date().toISOString()
        const pets = await db.all<Array<{
            id: string
            name: string
            nextService: string | null
            nextServiceTime: string | null
            tutorName: string
        }>>(`
            SELECT 
                p.id,
                p.name,
                j.name as nextService,
                b.bookingDate as nextServiceTime,
                u.name as tutorName
            FROM pets p
            LEFT JOIN users u ON p.userId = u.id
            LEFT JOIN (
                SELECT petId, jobId, bookingDate
                FROM bookings
                WHERE bookingDate >= ?
                AND status != 'cancelado'
                ORDER BY bookingDate ASC
            ) b ON p.id = b.petId
            LEFT JOIN jobs j ON b.jobId = j.id
            GROUP BY p.id
            ORDER BY 
                CASE WHEN b.bookingDate IS NULL THEN 1 ELSE 0 END,
                b.bookingDate ASC,
                p.name ASC
        `, [now])
        return pets
    }

    async getUpcomingBookings(): Promise<Array<{
        id: string
        serviceName: string
        petName: string
        tutorName: string
        bookingDate: string
    }>> {
        const now = new Date().toISOString()
        const bookings = await db.all<Array<{
            id: string
            serviceName: string
            petName: string
            tutorName: string
            bookingDate: string
        }>>(`
            SELECT 
                b.id,
                j.name as serviceName,
                p.name as petName,
                u.name as tutorName,
                b.bookingDate
            FROM bookings b
            JOIN jobs j ON b.jobId = j.id
            JOIN pets p ON b.petId = p.id
            JOIN users u ON b.userId = u.id
            WHERE b.bookingDate >= ?
            AND b.status != 'cancelado'
            ORDER BY b.bookingDate ASC
        `, [now])
        return bookings
    }
}
