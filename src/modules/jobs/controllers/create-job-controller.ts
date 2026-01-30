import type { Request, Response } from "express";
import { CreateJobService } from "../services/create-job-service";
import { JobsRepository } from "../repositories/jobs-repository";

export class CreateJobController {
    static async handle(request: Request, response: Response) {
        const { name, description, priceP, priceM, priceG, duration, availability } = request.body;

        const repository = new JobsRepository();
        const service = new CreateJobService(repository);
        const job = await service.execute({
            name,
            description,
            priceP,
            priceM,
            priceG,
            duration,
            availability,
        });

        return response.status(201).json(job);
    }
}
