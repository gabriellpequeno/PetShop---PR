import type { Request, Response } from "express";
import { ListBookingsService } from "../services/list-bookings-service";
import { BookingsRepository } from "../repositories/bookings-repository";

export class ListBookingsController {
    static async handle(request: Request, response: Response) {
        const userId = request.user.id;
        const userRole = request.user.role;

        const repository = new BookingsRepository();
        const service = new ListBookingsService(repository);
        const bookings = await service.execute({ userId, userRole });

        return response.json(bookings);
    }
}
