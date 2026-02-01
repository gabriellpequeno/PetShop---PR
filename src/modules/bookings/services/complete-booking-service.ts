import { BadRequestError } from "../../../errors/bad-request-error";
import { NotFoundError } from "../../../errors/not-found-error";
import { UnauthorizedError } from "../../../errors/unauthorized-error";
import type { BookingsRepository } from "../repositories/bookings-repository";
import type { IBooking } from "../types/booking-types";

interface CompleteBookingRequest {
    bookingId: string;
    userRole: string;
    realStartTime?: string;
    realEndTime?: string;
}

export class CompleteBookingService {
  constructor(private repository: BookingsRepository) {}
    async execute({
        bookingId,
        userRole,
        realStartTime,
        realEndTime,
    }: CompleteBookingRequest): Promise<IBooking> {
        if (userRole !== "admin") {
            throw new UnauthorizedError("Apenas administradores podem registrar a execução de serviços.");
        }
        if (!bookingId || typeof bookingId !== "string") {
            throw new BadRequestError("ID do agendamento é obrigatório.");
        }

        const timeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
        if (realStartTime && !timeRegex.test(realStartTime)) {
            throw new BadRequestError("Horário de início deve estar no formato YYYY-MM-DD HH:mm");
        }
        if (realEndTime && !timeRegex.test(realEndTime)) {
            throw new BadRequestError("Horário de término deve estar no formato YYYY-MM-DD HH:mm");
        }

        if (realStartTime && realEndTime) {
            const startDate = new Date(realStartTime.replace(" ", "T"));
            const endDate = new Date(realEndTime.replace(" ", "T"));
            if (startDate >= endDate) {
                throw new BadRequestError("O horário de início deve ser anterior ao horário de término.");
            }
        }

        const booking = await this.repository.findById(bookingId);
        if (!booking) {
            throw new NotFoundError("Agendamento não encontrado.");
        }

        // Allow admin to complete a canceled booking (convert cancelado -> concluido)
        if (booking.status === "cancelado" && userRole !== "admin") {
            throw new BadRequestError("Não é possível completar um agendamento cancelado.");
        }
        if (booking.status === "concluido") {
            throw new BadRequestError("Este agendamento já foi concluído.");
        }

        await this.repository.complete(bookingId, realStartTime || null, realEndTime || null);

        return {
            ...booking,
            status: "concluido",
            realStartTime: realStartTime || null,
            realEndTime: realEndTime || null,
        };
    }
}