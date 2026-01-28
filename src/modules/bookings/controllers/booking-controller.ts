import type { Request, Response } from "express";
import { db } from "../../../database/db";
import { CreateBookingService } from "../services/create-booking-service";
import { ListBookingsService } from "../services/list-bookings-service";
import { CancelBookingService } from "../services/cancel-booking-service";
import { CompleteBookingService } from "../services/complete-booking-service";
import { BadRequestError } from "../../../errors/bad-request-error";

export class BookingController {
    static async create(request: Request, response: Response) {
        const { petId, jobId, bookingDate } = request.body;
        const userId = request.user.id;

        // Validação de formato de data no Controller (conforme PRD)
        const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
        if (!bookingDate || !dateRegex.test(bookingDate)) {
            throw new BadRequestError("Data deve estar no formato YYYY-MM-DD HH:mm");
        }

        const createBookingService = new CreateBookingService(db);
        const booking = await createBookingService.execute({
            userId,
            petId,
            jobId,
            bookingDate,
        });

        return response.status(201).json(booking);
    }

    static async list(request: Request, response: Response) {
        const userId = request.user.id;
        const userRole = request.user.role;

        const listBookingsService = new ListBookingsService(db);
        const bookings = await listBookingsService.execute({ userId, userRole });

        return response.json(bookings);
    }

    static async cancel(request: Request, response: Response) {
        const { id } = request.params;
        const userId = request.user.id;
        const userRole = request.user.role;

        if (!id || typeof id !== "string") {
            throw new BadRequestError("ID do agendamento é obrigatório.");
        }

        const cancelBookingService = new CancelBookingService(db);
        const booking = await cancelBookingService.execute({
            bookingId: id,
            userId,
            userRole,
        });

        return response.json(booking);
    }

    static async complete(request: Request, response: Response) {
        const { id } = request.params;
        const { realStartTime, realEndTime } = request.body;
        const userRole = request.user.role;

        if (!id || typeof id !== "string") {
            throw new BadRequestError("ID do agendamento é obrigatório.");
        }

        const completeBookingService = new CompleteBookingService(db);
        const booking = await completeBookingService.execute({
            bookingId: id,
            userRole,
            realStartTime,
            realEndTime,
        });

        return response.json(booking);
    }
}
