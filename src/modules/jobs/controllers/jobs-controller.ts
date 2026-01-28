import type { Request, Response } from "express";
import { db } from "../../../database/db";
import { CreateJobService } from "../services/create-job-service";
import { ListJobsService } from "../services/list-jobs-service";
import { UpdateJobService } from "../services/update-job-service";
import { DeleteJobService } from "../services/delete-job-service";

export class JobsController {
  static async create(request: Request, response: Response) {
    const { name, description, price, duration } = request.body;

    const createJobService = new CreateJobService(db);
    const job = await createJobService.execute({
      name,
      description,
      price,
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
      throw new Error("ID inválido"); // Ou use BadRequestError se disponível no escopo
    }

    const { name, description, price, duration } = request.body;

    const updateJobService = new UpdateJobService(db);
    const job = await updateJobService.execute({
      id,
      name,
      description,
      price,
      duration,
    });

    return response.json(job);
  }

  static async delete(request: Request, response: Response) {
    const { id } = request.params;

    if (!id || typeof id !== "string") {
      throw new Error("ID inválido");
    }

    const deleteJobService = new DeleteJobService(db);
    await deleteJobService.execute(id);

    return response.status(204).send();
  }
}
