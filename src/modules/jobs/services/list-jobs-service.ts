import type { JobsRepository } from "../repositories/jobs-repository";
import type { Job } from "../models/job";

export class ListJobsService {
  constructor(private repository: JobsRepository) { }

  async execute(): Promise<Job[]> {
    return this.repository.findAll();
  }
}