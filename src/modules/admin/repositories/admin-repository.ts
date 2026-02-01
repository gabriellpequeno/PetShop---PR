import { db } from '@/database/db'
import type { DashboardCounts, UserSummary } from '../types/admin-types'

export class AdminRepository {
    async countUsersByPeriod(startDate: string, endDate: string): Promise<number> {
        const result = await db.get<{ count: number }>(
            `SELECT COUNT(*) as count FROM users WHERE role = 'customer'`
        )
        return result?.count ?? 0
    }

    async countPetsByPeriod(startDate: string, endDate: string): Promise<number> {
        const result = await db.get<{ count: number }>(
            `SELECT COUNT(*) as count FROM pets`
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
            db.get<{ count: number }>('SELECT COUNT(*) as count FROM users WHERE role = \'customer\''),
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

    async getUsersListWithNextService(hasService: 'all' | 'with_service' = 'all'): Promise<Array<{
        id: string
        name: string
        nextService: string | null
        nextServiceTime: string | null
        nextPetName: string | null
        nextPetSpecies: string | null
        petsCount: number
    }>> {
        const now = new Date()
        const today = now.toISOString().split('T')[0]
        const currentTime = now.toTimeString().slice(0, 5)
        
        const havingClause = hasService === 'with_service' ? 'HAVING nextService IS NOT NULL' : ''
        
        const users = await db.all<Array<{
            id: string
            name: string
            nextService: string | null
            nextServiceTime: string | null
            nextPetName: string | null
            nextPetSpecies: string | null
            petsCount: number
        }>>(`
            SELECT 
                u.id,
                u.name,
                j.name as nextService,
                (b.bookingDate || ' ' || b.bookingTime) as nextServiceTime,
                p.name as nextPetName,
                p.species as nextPetSpecies,
                (SELECT COUNT(*) FROM pets WHERE userId = u.id) as petsCount
            FROM users u
            LEFT JOIN (
                SELECT userId, jobId, petId, bookingDate, bookingTime
                FROM bookings
                WHERE (bookingDate > ? OR (bookingDate = ? AND bookingTime >= ?))
                AND status != 'cancelado'
                ORDER BY bookingDate ASC, bookingTime ASC
            ) b ON u.id = b.userId
            LEFT JOIN jobs j ON b.jobId = j.id
            LEFT JOIN pets p ON b.petId = p.id
            WHERE u.role = 'customer'
            GROUP BY u.id
            ${havingClause}
            ORDER BY 
                CASE WHEN b.bookingDate IS NULL THEN 1 ELSE 0 END,
                b.bookingDate ASC,
                b.bookingTime ASC,
                u.name ASC
        `, [today, today, currentTime])
        return users
    }

    async getPetsListWithNextService(hasService: 'all' | 'with_service' = 'all'): Promise<Array<{
        id: string
        name: string
        nextService: string | null
        nextServiceTime: string | null
        tutorName: string
    }>> {
        const now = new Date()
        const today = now.toISOString().split('T')[0]
        const currentTime = now.toTimeString().slice(0, 5)
        
        const havingClause = hasService === 'with_service' ? 'HAVING nextService IS NOT NULL' : ''
        
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
                (b.bookingDate || ' ' || b.bookingTime) as nextServiceTime,
                u.name as tutorName
            FROM pets p
            LEFT JOIN users u ON p.userId = u.id
            LEFT JOIN (
                SELECT petId, jobId, bookingDate, bookingTime
                FROM bookings
                WHERE (bookingDate > ? OR (bookingDate = ? AND bookingTime >= ?))
                AND status != 'cancelado'
                ORDER BY bookingDate ASC, bookingTime ASC
            ) b ON p.id = b.petId
            LEFT JOIN jobs j ON b.jobId = j.id
            GROUP BY p.id
            ${havingClause}
            ORDER BY 
                CASE WHEN b.bookingDate IS NULL THEN 1 ELSE 0 END,
                b.bookingDate ASC,
                b.bookingTime ASC,
                p.name ASC
        `, [today, today, currentTime])
        return pets
    }

    async getUpcomingBookings(
        filter: 'upcoming' | 'completed' = 'upcoming',
        status: 'all' | 'active' | 'cancelled' = 'all'
    ): Promise<Array<{
        id: string
        serviceName: string
        petName: string
        tutorName: string
        bookingDate: string
        status: string
    }>> {
        const now = new Date()
        const today = now.toISOString().split('T')[0]
        const currentTime = now.toTimeString().slice(0, 5)
        
        const timeClause = filter === 'upcoming'
            ? `(b.bookingDate > ? OR (b.bookingDate = ? AND b.bookingTime >= ?))`
            : `(b.bookingDate < ? OR (b.bookingDate = ? AND b.bookingTime < ?))`
        
        const statusClause = status === 'all' 
            ? '' 
            : status === 'active'
            ? `AND b.status != 'cancelado'`
            : `AND b.status = 'cancelado'`
        
        const bookings = await db.all<Array<{
            id: string
            serviceName: string
            petName: string
            tutorName: string
            bookingDate: string
            status: string
        }>>(`
            SELECT 
                b.id,
                j.name as serviceName,
                p.name as petName,
                u.name as tutorName,
                (b.bookingDate || ' ' || b.bookingTime) as bookingDate,
                b.status
            FROM bookings b
            JOIN jobs j ON b.jobId = j.id
            JOIN pets p ON b.petId = p.id
            JOIN users u ON b.userId = u.id
            WHERE ${timeClause} ${statusClause}
            ORDER BY 
                CASE WHEN b.status = 'cancelado' THEN 1 ELSE 0 END,
                b.bookingDate ${filter === 'upcoming' ? 'ASC' : 'DESC'}, 
                b.bookingTime ${filter === 'upcoming' ? 'ASC' : 'DESC'}
        `, [today, today, currentTime])
        return bookings
    }
}
