import { BadRequestError } from "../../../errors/bad-request-error";
import { NotFoundError } from "../../../errors/not-found-error";
import { ConflictError } from "../../../errors/conflict-error";
import type { BookingsRepository } from "../repositories/bookings-repository";
import type { PetsRepository } from "../../pets/repositories/pets-repository";
import type { JobsRepository } from "../../jobs/repositories/jobs-repository";
import type { IBooking, IBookingCreate } from "../types/booking-types";
import type { PetSize } from "../../pets/models/pet";

export class CreateBookingService {
    constructor(
        private bookingsRepository: BookingsRepository,
        private petsRepository: PetsRepository,
        private jobsRepository: JobsRepository
    ) { }

    private calculatePrice(petSize: PetSize, job: { priceP: number; priceM: number; priceG: number }): number {
        switch (petSize) {
            case 'P':
                return job.priceP;
            case 'M':
                return job.priceM;
            case 'G':
                return job.priceG;
            default:
                return job.priceM; // Default to medium if unknown
        }
    }

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

        if (!data.bookingTime || typeof data.bookingTime !== "string") {
            throw new BadRequestError("Horário do agendamento é obrigatório.");
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(data.bookingDate)) {
            throw new BadRequestError("Data deve estar no formato YYYY-MM-DD");
        }

        const timeRegex = /^\d{2}:\d{2}$/;
        if (!timeRegex.test(data.bookingTime)) {
            throw new BadRequestError("Horário deve estar no formato HH:MM");
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

        // Check if job is available at this day/time
        // Parse the date to get day of week correctly (add T12:00 to avoid timezone issues)
        const bookingDateObj = new Date(`${data.bookingDate}T12:00:00`);
        const dayOfWeek = bookingDateObj.getDay();
        
        // Only check availability if job has availability defined
        const hasAvailability = job.availability && job.availability.length > 0;
        if (hasAvailability) {
            const isAvailable = job.availability!.some(avail => 
                avail.dayOfWeek === dayOfWeek &&
                avail.startTime <= data.bookingTime! &&
                avail.endTime > data.bookingTime!
            );

            if (!isAvailable) {
                throw new BadRequestError("Este serviço não está disponível neste dia/horário.");
            }
        }

        const existingBooking = await this.bookingsRepository.findDuplicate(
            data.petId,
            data.jobId,
            data.bookingDate,
            data.bookingTime
        );
        if (existingBooking) {
            throw new ConflictError(
                "Já existe um agendamento para este pet, serviço e horário."
            );
        }

        // Calculate price based on pet size
        const price = this.calculatePrice(pet.size, job);

        return this.bookingsRepository.create(data, price);
    }
}
