import type { Database } from "sqlite";
import { randomUUID } from "node:crypto";
import { BadRequestError } from "../../../errors/bad-request-error";
import { NotFoundError } from "../../../errors/not-found-error";
import { ConflictError } from "../../../errors/conflict-error";
import type { IBooking, IBookingCreate } from "../types/booking-types";

export class CreateBookingService {
    constructor(private db: Database) { }

    async execute({ userId, petId, jobId, bookingDate }: IBookingCreate): Promise<IBooking> {
        // 1. Validação: userId obrigatório
        if (!userId || typeof userId !== "string") {
            throw new BadRequestError("ID do usuário é obrigatório.");
        }

        // 2. Validação: petId obrigatório
        if (!petId || typeof petId !== "string") {
            throw new BadRequestError("ID do pet é obrigatório.");
        }

        // 3. Validação: jobId obrigatório
        if (!jobId || typeof jobId !== "string") {
            throw new BadRequestError("ID do serviço é obrigatório.");
        }

        // 4. Validação: bookingDate obrigatório e formato correto (YYYY-MM-DD HH:mm)
        if (!bookingDate || typeof bookingDate !== "string") {
            throw new BadRequestError("Data do agendamento é obrigatória.");
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
        if (!dateRegex.test(bookingDate)) {
            throw new BadRequestError("Data deve estar no formato YYYY-MM-DD HH:mm");
        }

        // 5. Verificar se o pet existe e pertence ao usuário
        const pet = await this.db.get(
            "SELECT id, userId FROM pets WHERE id = ?",
            [petId]
        );

        if (!pet) {
            throw new NotFoundError("Pet não encontrado.");
        }

        if (pet.userId !== userId) {
            throw new BadRequestError("Este pet não pertence ao usuário.");
        }

        // 6. Verificar se o job existe
        const job = await this.db.get("SELECT id FROM jobs WHERE id = ?", [jobId]);

        if (!job) {
            throw new NotFoundError("Serviço não encontrado.");
        }

        // 7. Verificar duplicidade (pet + job + horário)
        const existingBooking = await this.db.get(
            `SELECT id FROM bookings 
       WHERE petId = ? AND jobId = ? AND bookingDate = ? AND status != 'cancelado'`,
            [petId, jobId, bookingDate]
        );

        if (existingBooking) {
            throw new ConflictError(
                "Já existe um agendamento para este pet, serviço e horário."
            );
        }

        // 8. Criar o agendamento
        const now = new Date().toISOString();
        const newBooking: IBooking = {
            id: randomUUID(),
            userId,
            petId,
            jobId,
            bookingDate,
            status: "agendado",
            realStartTime: null,
            realEndTime: null,
            createdAt: now,
        };

        await this.db.run(
            `INSERT INTO bookings (id, userId, petId, jobId, bookingDate, status, realStartTime, realEndTime, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newBooking.id,
                newBooking.userId,
                newBooking.petId,
                newBooking.jobId,
                newBooking.bookingDate,
                newBooking.status,
                newBooking.realStartTime,
                newBooking.realEndTime,
                newBooking.createdAt,
            ]
        );

        return newBooking;
    }
}
