import type { Request, Response } from "express";
import { CompleteBookingService } from "../services/complete-booking-service";
import { BookingsRepository } from "../repositories/bookings-repository";
import { BadRequestError } from "../../../errors/bad-request-error";

export class CompleteBookingController {
    static async handle(request: Request, response: Response) {
        const { id } = request.params;
        const { realStartTime, realEndTime } = request.body;
        const userRole = request.user.role;

        if (!id || typeof id !== "string") {
            throw new BadRequestError("ID do agendamento é obrigatório.");
        }

        const repository = new BookingsRepository();
        const service = new CompleteBookingService(repository);
        const booking = await service.execute({
            bookingId: id,
            userRole,
            realStartTime,
            realEndTime,
        });

        return response.json(booking);
    }
}
