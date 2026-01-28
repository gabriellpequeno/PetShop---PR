import { Database } from "sqlite";
import { randomUUID } from "node:crypto";
import { BadRequestError } from "../../../errors/bad-request-error";
import { ConflictError } from "../../../errors/conflict-error";

interface CreateJobRequest {
  name: string;
  description?: string;
  price: number;
  duration: number;
}

export class CreateJobService {
  constructor(private db: Database) {}

  async execute({ name, description, price, duration }: CreateJobRequest) {
    // 1. Validação Manual: Nome
    if (!name || name.trim().length < 3) {
      throw new BadRequestError(
        "O nome do serviço deve ter pelo menos 3 caracteres.",
      );
    }

    // 2. Validação Manual: Preço
    if (typeof price !== "number" || price <= 0) {
      throw new BadRequestError("O preço deve ser um número maior que zero.");
    }

    // 3. Validação Manual: Duração
    if (typeof duration !== "number" || duration <= 0) {
      throw new BadRequestError(
        "A duração deve ser informada em minutos e ser maior que zero.",
      );
    }

    // 4. Verificação de Duplicidade (Opcional, mas boa prática)
    const jobExists = await this.db.get("SELECT id FROM jobs WHERE name = ?", [
      name,
    ]);

    if (jobExists) {
      throw new ConflictError("Já existe um serviço cadastrado com este nome.");
    }

    const newJob = {
      id: randomUUID(),
      name,
      description: description || "",
      price,
      duration,
    };

    // 5. Persistência
    await this.db.run(
      "INSERT INTO jobs (id, name, description, price, duration) VALUES (?, ?, ?, ?, ?)",
      [
        newJob.id,
        newJob.name,
        newJob.description,
        newJob.price,
        newJob.duration,
      ],
    );

    return newJob;
  }
}
