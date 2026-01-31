import type { Request, Response } from "express";
import { ReopenBookingService } from "../services/reopen-booking-service";
import { BookingsRepository } from "../repositories/bookings-repository";
import { BadRequestError } from "../../../errors/bad-request-error";

export class ReopenBookingController {
    static async handle(request: Request, response: Response) {
        const { id } = request.params;
        const userRole = request.user.role;

        if (!id || typeof id !== "string") {
            throw new BadRequestError("ID do agendamento é obrigatório.");
        }

        const repository = new BookingsRepository();
        const service = new ReopenBookingService(repository);
        const booking = await service.execute({
            bookingId: id,
            userRole,
        });

        return response.json(booking);
    }
}
