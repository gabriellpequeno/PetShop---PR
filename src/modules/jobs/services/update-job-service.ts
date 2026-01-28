import { Database } from "sqlite";
import { BadRequestError } from "../../../errors/bad-request-error";
import { NotFoundError } from "../../../errors/not-found-error";

interface UpdateJobRequest {
  id: string;
  name?: string;
  description?: string;
  priceP?: number;
  priceM?: number;
  priceG?: number;
  duration?: number;
}

export class UpdateJobService {
  constructor(private db: Database) { }

  async execute({ id, name, description, priceP, priceM, priceG, duration }: UpdateJobRequest) {
    if (!id) {
      throw new BadRequestError("O ID do serviço é obrigatório.");
    }

    // Verificar se o serviço existe
    const job = await this.db.get("SELECT * FROM jobs WHERE id = ?", [id]);

    if (!job) {
      throw new NotFoundError("Serviço não encontrado.");
    }

    // Validações
    if (name !== undefined && name.trim().length < 3) {
      throw new BadRequestError(
        "O nome do serviço deve ter pelo menos 3 caracteres.",
      );
    }
    if (priceP !== undefined && (typeof priceP !== "number" || priceP <= 0)) {
      throw new BadRequestError("O preço P deve ser um número maior que zero.");
    }

    if (priceM !== undefined && (typeof priceM !== "number" || priceM <= 0)) {
      throw new BadRequestError("O preço M deve ser um número maior que zero.");
    }

    if (priceG !== undefined && (typeof priceG !== "number" || priceG <= 0)) {
      throw new BadRequestError("O preço G deve ser um número maior que zero.");
    }

    if (
      duration !== undefined &&
      (typeof duration !== "number" || duration <= 0)
    ) {
      throw new BadRequestError(
        "A duração deve ser informada em minutos e ser maior que zero.",
      );
    }

    // Preparar campos para autorização
    // Mantém o valor atual se não for passado um novo
    const updatedName = name !== undefined ? name : job.name;
    const updatedDescription =
      description !== undefined ? description : job.description;
    const updatedPriceP = priceP !== undefined ? priceP : job.priceP;
    const updatedPriceM = priceM !== undefined ? priceM : job.priceM;
    const updatedPriceG = priceG !== undefined ? priceG : job.priceG;
    const updatedDuration = duration !== undefined ? duration : job.duration;

    await this.db.run(
      `UPDATE jobs 
       SET name = ?, description = ?, priceP = ?, priceM = ?, priceG = ?, duration = ?
       WHERE id = ?`,
      [updatedName, updatedDescription, updatedPriceP, updatedPriceM, updatedPriceG, updatedDuration, id],
    );

    return {
      id,
      name: updatedName,
      description: updatedDescription,
      priceP: updatedPriceP,
      priceM: updatedPriceM,
      priceG: updatedPriceG,
      duration: updatedDuration,
    };
  }
}
