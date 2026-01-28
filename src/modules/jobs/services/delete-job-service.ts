import { BadRequestError } from "../../../errors/bad-request-error";
import { NotFoundError } from "../../../errors/not-found-error";
import type { JobsRepository } from "../repositories/jobs-repository";

export class DeleteJobService {
  constructor(private repository: JobsRepository) { }

  async execute(id: string): Promise<void> {
    if (!id) {
      throw new BadRequestError("O ID do serviço é obrigatório.");
    }

    const job = await this.repository.findById(id);
    if (!job) {
      throw new NotFoundError("Serviço não encontrado.");
    }

    await this.repository.delete(id);
  }
}
