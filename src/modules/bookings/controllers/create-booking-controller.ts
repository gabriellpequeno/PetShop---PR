import type { Request, Response } from "express";
import { CreateBookingService } from "../services/create-booking-service";
import { BookingsRepository } from "../repositories/bookings-repository";
import { PetsRepository } from "../../pets/repositories/pets-repository";
import { JobsRepository } from "../../jobs/repositories/jobs-repository";

export class CreateBookingController {
    static async handle(request: Request, response: Response) {
        const { petId, jobId, bookingDate } = request.body;
        const userId = request.user.id;

        const bookingsRepository = new BookingsRepository();
        const petsRepository = new PetsRepository();
        const jobsRepository = new JobsRepository();
        const service = new CreateBookingService(
            bookingsRepository,
            petsRepository,
            jobsRepository
        );

        const booking = await service.execute({
            userId,
            userRole: request.user.role,
            petId,
            jobId,
            bookingDate,
        });

        return response.status(201).json(booking);
    }
}
