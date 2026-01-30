import type { Request, Response } from 'express'
import { AdminRepository } from '../repositories/admin-repository'

export class BookingsListController {
    static async handle(request: Request, response: Response) {
        const filter = (request.query.filter as 'upcoming' | 'completed') || 'upcoming'
        const status = (request.query.status as 'all' | 'active' | 'cancelled') || 'all'
        const repository = new AdminRepository()
        const bookings = await repository.getUpcomingBookings(filter, status)
        return response.json(bookings)
    }
}
