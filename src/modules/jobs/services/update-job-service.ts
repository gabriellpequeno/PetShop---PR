import { BadRequestError } from "../../../errors/bad-request-error";
import { NotFoundError } from "../../../errors/not-found-error";
import type { JobsRepository } from "../repositories/jobs-repository";
import type { UpdateJobData, Job } from "../models/job";

interface UpdateJobRequest extends UpdateJobData {
  id: string;
}

export class UpdateJobService {
  constructor(private repository: JobsRepository) { }

  async execute(data: UpdateJobRequest): Promise<Job> {
    if (!data.id) {
      throw new BadRequestError("O ID do serviço é obrigatório.");
    }

    const job = await this.repository.findById(data.id);
    if (!job) {
      throw new NotFoundError("Serviço não encontrado.");
    }

    if (data.name !== undefined && data.name.trim().length < 3) {
      throw new BadRequestError(
        "O nome do serviço deve ter pelo menos 3 caracteres."
      );
    }
    if (data.priceP !== undefined && (typeof data.priceP !== "number" || data.priceP <= 0)) {
      throw new BadRequestError("O preço P deve ser um número maior que zero.");
    }
    if (data.priceM !== undefined && (typeof data.priceM !== "number" || data.priceM <= 0)) {
      throw new BadRequestError("O preço M deve ser um número maior que zero.");
    }
    if (data.priceG !== undefined && (typeof data.priceG !== "number" || data.priceG <= 0)) {
      throw new BadRequestError("O preço G deve ser um número maior que zero.");
    }
    if (data.duration !== undefined && (typeof data.duration !== "number" || data.duration <= 0)) {
      throw new BadRequestError(
        "A duração deve ser informada em minutos e ser maior que zero."
      );
    }

    return this.repository.update(data.id, data, job);
  }
}
