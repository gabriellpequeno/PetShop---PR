import type { Request, Response } from "express";
import { CancelBookingService } from "../services/cancel-booking-service";
import { BookingsRepository } from "../repositories/bookings-repository";
import { BadRequestError } from "../../../errors/bad-request-error";

export class CancelBookingController {
    static async handle(request: Request, response: Response) {
        const { id } = request.params;
        const userId = request.user.id;
        const userRole = request.user.role;

        if (!id || typeof id !== "string") {
            throw new BadRequestError("ID do agendamento é obrigatório.");
        }

        const repository = new BookingsRepository();
        const service = new CancelBookingService(repository);
        const booking = await service.execute({
            bookingId: id,
            userId,
            userRole,
        });

        return response.json(booking);
    }
}
