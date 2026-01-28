import type { Database } from "sqlite";
import { BadRequestError } from "../../../errors/bad-request-error";
import { NotFoundError } from "../../../errors/not-found-error";
import { UnauthorizedError } from "../../../errors/unauthorized-error";
import type { IBooking } from "../types/booking-types";

interface CompleteBookingRequest {
    bookingId: string;
    userRole: string;
    realStartTime: string;
    realEndTime: string;
}

export class CompleteBookingService {
    constructor(private db: Database) { }

    async execute({
        bookingId,
        userRole,
        realStartTime,
        realEndTime,
    }: CompleteBookingRequest): Promise<IBooking> {
        // 1. Apenas admin pode completar agendamentos
        if (userRole !== "admin") {
            throw new UnauthorizedError("Apenas administradores podem registrar a execução de serviços.");
        }

        // 2. Validação: bookingId obrigatório
        if (!bookingId || typeof bookingId !== "string") {
            throw new BadRequestError("ID do agendamento é obrigatório.");
        }

        // 3. Validação: horários obrigatórios
        const timeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;

        if (!realStartTime || !timeRegex.test(realStartTime)) {
            throw new BadRequestError("Horário de início deve estar no formato YYYY-MM-DD HH:mm");
        }

        if (!realEndTime || !timeRegex.test(realEndTime)) {
            throw new BadRequestError("Horário de término deve estar no formato YYYY-MM-DD HH:mm");
        }

        // 4. Validar que início é antes do término
        const startDate = new Date(realStartTime.replace(" ", "T"));
        const endDate = new Date(realEndTime.replace(" ", "T"));

        if (startDate >= endDate) {
            throw new BadRequestError("O horário de início deve ser anterior ao horário de término.");
        }

        // 5. Buscar o agendamento
        const booking = await this.db.get<IBooking>(
            "SELECT * FROM bookings WHERE id = ?",
            [bookingId]
        );

        if (!booking) {
            throw new NotFoundError("Agendamento não encontrado.");
        }

        // 6. Verificar status
        if (booking.status === "cancelado") {
            throw new BadRequestError("Não é possível completar um agendamento cancelado.");
        }

        if (booking.status === "concluido") {
            throw new BadRequestError("Este agendamento já foi concluído.");
        }

        // 7. Atualizar o agendamento
        await this.db.run(
            `UPDATE bookings 
       SET status = 'concluido', realStartTime = ?, realEndTime = ? 
       WHERE id = ?`,
            [realStartTime, realEndTime, bookingId]
        );

        return {
            ...booking,
            status: "concluido",
            realStartTime,
            realEndTime,
        };
    }
}
