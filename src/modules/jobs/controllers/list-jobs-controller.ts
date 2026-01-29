import type { Request, Response } from "express";
import { ListJobsService } from "../services/list-jobs-service";
import { JobsRepository } from "../repositories/jobs-repository";

export class ListJobsController {
    static async handle(_request: Request, response: Response) {
        const repository = new JobsRepository();
        const service = new ListJobsService(repository);
        const jobs = await service.execute();

        return response.json(jobs);
    }
}
