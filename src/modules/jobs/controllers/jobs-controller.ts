import type { Request, Response } from "express";
import { db } from "../../../database/db";
import { CreateJobService } from "../services/create-job-service";
import { ListJobsService } from "../services/list-jobs-service";
import { UpdateJobService } from "../services/update-job-service";
import { DeleteJobService } from "../services/delete-job-service";
import { BadRequestError } from "../../../errors/bad-request-error";

export class JobsController {
  static async create(request: Request, response: Response) {
    const { name, description, priceP, priceM, priceG, duration } = request.body;

    const createJobService = new CreateJobService(db);
    const job = await createJobService.execute({
      name,
      description,
      priceP,
      priceM,
      priceG,
      duration,
    });

    return response.status(201).json(job);
  }

  static async list(_request: Request, response: Response) {
    const listJobsService = new ListJobsService(db);
    const jobs = await listJobsService.execute();

    return response.json(jobs);
  }

  static async update(request: Request, response: Response) {
    const { id } = request.params;

    if (!id || typeof id !== "string") {
      throw new BadRequestError("ID inválido");
    }

    const { name, description, priceP, priceM, priceG, duration } = request.body;

    const updateJobService = new UpdateJobService(db);
    const job = await updateJobService.execute({
      id,
      name,
      description,
      priceP,
      priceM,
      priceG,
      duration,
    });

    return response.json(job);
  }

  static async delete(request: Request, response: Response) {
    const { id } = request.params;

    if (!id || typeof id !== "string") {
      throw new BadRequestError("ID inválido");
    }

    const deleteJobService = new DeleteJobService(db);
    await deleteJobService.execute(id);

    return response.status(204).send();
  }
}
