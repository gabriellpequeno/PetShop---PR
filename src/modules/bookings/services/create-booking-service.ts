import { BadRequestError } from "../../../errors/bad-request-error";
import { NotFoundError } from "../../../errors/not-found-error";
import { ConflictError } from "../../../errors/conflict-error";
import type { BookingsRepository } from "../repositories/bookings-repository";
import type { PetsRepository } from "../../pets/repositories/pets-repository";
import type { JobsRepository } from "../../jobs/repositories/jobs-repository";
import type { IBooking, IBookingCreate } from "../types/booking-types";

export class CreateBookingService {
    constructor(
        private bookingsRepository: BookingsRepository,
        private petsRepository: PetsRepository,
        private jobsRepository: JobsRepository
    ) { }

    async execute(data: IBookingCreate): Promise<IBooking> {
        if (!data.userId || typeof data.userId !== "string") {
            throw new BadRequestError("ID do usuário é obrigatório.");
        }

        if (!data.petId || typeof data.petId !== "string") {
            throw new BadRequestError("ID do pet é obrigatório.");
        }

        if (!data.jobId || typeof data.jobId !== "string") {
            throw new BadRequestError("ID do serviço é obrigatório.");
        }

        if (!data.bookingDate || typeof data.bookingDate !== "string") {
            throw new BadRequestError("Data do agendamento é obrigatória.");
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
        if (!dateRegex.test(data.bookingDate)) {
            throw new BadRequestError("Data deve estar no formato YYYY-MM-DD HH:mm");
        }

        const pet = await this.petsRepository.findById(data.petId);
        if (!pet) {
            throw new NotFoundError("Pet não encontrado.");
        }
        if (data.userRole === "admin") {
            data.userId = pet.userId;
        } else if (pet.userId !== data.userId) {
            throw new BadRequestError("Este pet não pertence ao usuário.");
        }

        const job = await this.jobsRepository.findById(data.jobId);
        if (!job) {
            throw new NotFoundError("Serviço não encontrado.");
        }
        const existingBooking = await this.bookingsRepository.findDuplicate(
            data.petId,
            data.jobId,
            data.bookingDate
        );
        if (existingBooking) {
            throw new ConflictError(
                "Já existe um agendamento para este pet, serviço e horário."
            );
        }

        return this.bookingsRepository.create(data);
    }
}
