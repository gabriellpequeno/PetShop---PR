import type { Request, Response } from "express";
import { DeleteJobService } from "../services/delete-job-service";
import { JobsRepository } from "../repositories/jobs-repository";
import { BadRequestError } from "../../../errors/bad-request-error";

export class DeleteJobController {
    static async handle(request: Request, response: Response) {
        const { id } = request.params;

        if (!id || typeof id !== "string") {
            throw new BadRequestError("ID inválido");
        }

        const repository = new JobsRepository();
        const service = new DeleteJobService(repository);
        await service.execute(id);

        return response.status(204).send();
    }
}
