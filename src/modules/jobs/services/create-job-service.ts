import { BadRequestError } from "../../../errors/bad-request-error";
import { ConflictError } from "../../../errors/conflict-error";
import type { JobsRepository } from "../repositories/jobs-repository";
import type { CreateJobData, Job } from "../models/job";

export class CreateJobService {
  constructor(private repository: JobsRepository) { }

  async execute(data: CreateJobData): Promise<Job> {
    if (!data.name || data.name.trim().length < 3) {
      throw new BadRequestError(
        "O nome do serviço deve ter pelo menos 3 caracteres."
      );
    }

    if (
      typeof data.priceP !== "number" ||
      typeof data.priceM !== "number" ||
      typeof data.priceG !== "number" ||
      data.priceP <= 0 ||
      data.priceM <= 0 ||
      data.priceG <= 0
    ) {
      throw new BadRequestError("O preço deve ser um número maior que zero.");
    }

    if (typeof data.duration !== "number" || data.duration <= 0) {
      throw new BadRequestError(
        "A duração deve ser informada em minutos e ser maior que zero."
      );
    }

    const jobExists = await this.repository.findByName(data.name);
    if (jobExists) {
      throw new ConflictError("Já existe um serviço cadastrado com este nome.");
    }

    return this.repository.create(data);
  }
}
