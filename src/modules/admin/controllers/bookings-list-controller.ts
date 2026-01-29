import type { Request, Response } from 'express'
import { AdminRepository } from '../repositories/admin-repository'

export class BookingsListController {
    static async handle(_request: Request, response: Response) {
        const repository = new AdminRepository()
        const bookings = await repository.getUpcomingBookings()
        return response.json(bookings)
    }
}
