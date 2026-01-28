import type { Database } from "sqlite";
import { BadRequestError } from "../../../errors/bad-request-error";
import { NotFoundError } from "../../../errors/not-found-error";
import type { IBooking } from "../types/booking-types";

interface CancelBookingRequest {
    bookingId: string;
    userId: string;
    userRole: string;
}

export class CancelBookingService {
    constructor(private db: Database) { }

    async execute({ bookingId, userId, userRole }: CancelBookingRequest): Promise<IBooking> {
        // 1. Validação: bookingId obrigatório
        if (!bookingId || typeof bookingId !== "string") {
            throw new BadRequestError("ID do agendamento é obrigatório.");
        }

        // 2. Buscar o agendamento
        const booking = await this.db.get<IBooking>(
            "SELECT * FROM bookings WHERE id = ?",
            [bookingId]
        );

        if (!booking) {
            throw new NotFoundError("Agendamento não encontrado.");
        }

        // 3. Verificar propriedade (apenas dono ou admin pode cancelar)
        if (userRole !== "admin" && booking.userId !== userId) {
            throw new BadRequestError("Você não tem permissão para cancelar este agendamento.");
        }

        // 4. Verificar se já está cancelado ou concluído
        if (booking.status === "cancelado") {
            throw new BadRequestError("Este agendamento já foi cancelado.");
        }

        if (booking.status === "concluido") {
            throw new BadRequestError("Não é possível cancelar um agendamento já concluído.");
        }

        // 5. Verificar se a data é futura
        const bookingDateTime = new Date(booking.bookingDate.replace(" ", "T"));
        const now = new Date();

        if (bookingDateTime <= now) {
            throw new BadRequestError("Não é possível cancelar agendamentos passados ou em andamento.");
        }

        // 6. Atualizar status para cancelado
        await this.db.run(
            "UPDATE bookings SET status = 'cancelado' WHERE id = ?",
            [bookingId]
        );

        return {
            ...booking,
            status: "cancelado",
        };
    }
}
