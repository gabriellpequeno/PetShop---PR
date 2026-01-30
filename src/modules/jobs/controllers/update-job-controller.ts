import type { Request, Response } from "express";
import { UpdateJobService } from "../services/update-job-service";
import { JobsRepository } from "../repositories/jobs-repository";
import { BadRequestError } from "../../../errors/bad-request-error";

export class UpdateJobController {
    static async handle(request: Request, response: Response) {
        const { id } = request.params;

        if (!id || typeof id !== "string") {
            throw new BadRequestError("ID inválido");
        }

        const { name, description, priceP, priceM, priceG, duration, availability } = request.body;

        const repository = new JobsRepository();
        const service = new UpdateJobService(repository);
        const job = await service.execute({
            id,
            name,
            description,
            priceP,
            priceM,
            priceG,
            duration,
            availability,
        });

        return response.json(job);
    }
}
