import { BadRequestError } from "../../../errors/bad-request-error";
import { NotFoundError } from "../../../errors/not-found-error";
import { UnauthorizedError } from "../../../errors/unauthorized-error";
import type { BookingsRepository } from "../repositories/bookings-repository";
import type { IBooking } from "../types/booking-types";

interface ReopenBookingRequest {
    bookingId: string;
    userRole: string;
}

export class ReopenBookingService {
    constructor(private repository: BookingsRepository) { }

    async execute({ bookingId, userRole }: ReopenBookingRequest): Promise<IBooking> {
        if (userRole !== "admin") {
            throw new UnauthorizedError("Apenas administradores podem reabrir agendamentos.");
        }

        if (!bookingId || typeof bookingId !== "string") {
            throw new BadRequestError("ID do agendamento é obrigatório.");
        }

        const booking = await this.repository.findById(bookingId);
        if (!booking) {
            throw new NotFoundError("Agendamento não encontrado.");
        }

        if (booking.status === "agendado") {
            throw new BadRequestError("Este agendamento já está com status 'agendado'.");
        }

        await this.repository.reopen(bookingId);

        return {
            ...booking,
            status: "agendado",
            realStartTime: null,
            realEndTime: null,
        };
    }
}
