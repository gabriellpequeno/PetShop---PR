import { BadRequestError } from "../../../errors/bad-request-error";
import { NotFoundError } from "../../../errors/not-found-error";
import type { BookingsRepository } from "../repositories/bookings-repository";
import type { IBooking } from "../types/booking-types";

interface CancelBookingRequest {
    bookingId: string;
    userId: string;
    userRole: string;
}

export class CancelBookingService {
    constructor(private repository: BookingsRepository) { }

    async execute({ bookingId, userId, userRole }: CancelBookingRequest): Promise<IBooking> {
        if (!bookingId || typeof bookingId !== "string") {
            throw new BadRequestError("ID do agendamento é obrigatório.");
        }

        const booking = await this.repository.findById(bookingId);
        if (!booking) {
            throw new NotFoundError("Agendamento não encontrado.");
        }

        if (userRole !== "admin" && booking.userId !== userId) {
            throw new BadRequestError("Você não tem permissão para cancelar este agendamento.");
        }

        if (booking.status === "cancelado") {
            throw new BadRequestError("Este agendamento já foi cancelado.");
        }
        if (booking.status === "concluido") {
            throw new BadRequestError("Não é possível cancelar um agendamento já concluído.");
        }

        // Combine bookingDate and bookingTime for accurate comparison
        const bookingDateTimeStr = `${booking.bookingDate}T${booking.bookingTime || '00:00'}`;
        const bookingDateTime = new Date(bookingDateTimeStr);
        const now = new Date();
        if (bookingDateTime <= now) {
            throw new BadRequestError("Não é possível cancelar agendamentos passados ou em andamento.");
        }

        await this.repository.updateStatus(bookingId, "cancelado");

        return {
            ...booking,
            status: "cancelado",
        };
    }
}
