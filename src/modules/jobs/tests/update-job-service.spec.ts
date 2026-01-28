import { describe, it, expect, vi, beforeEach } from "vitest";
import { Database } from "sqlite";
import { randomUUID } from "node:crypto";
import { UpdateJobService } from "../services/update-job-service";
import { BadRequestError } from "../../../errors/bad-request-error";
import { NotFoundError } from "../../../errors/not-found-error";

// Mock do banco de dados
const dbMock = {
  get: vi.fn(),
  run: vi.fn(),
} as unknown as Database;

describe("UpdateJobService", () => {
  let updateJobService: UpdateJobService;

  beforeEach(() => {
    updateJobService = new UpdateJobService(dbMock);
    vi.clearAllMocks();
  });

  it("deve atualizar um serviço com sucesso", async () => {
    const existingJob = {
      id: "job-123",
      name: "Banho",
      description: "Banho completo",
      price: 50,
      duration: 30,
    };

    // Mock para encontrar o job existente
    vi.spyOn(dbMock, "get").mockResolvedValueOnce(existingJob);

    const updateData = {
      id: "job-123",
      name: "Banho Premium",
      price: 80,
    };

    await updateJobService.execute(updateData);

    expect(dbMock.run).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE jobs"),
      expect.arrayContaining([
        "Banho Premium",
        "Banho completo",
        80,
        30,
        "job-123",
      ]),
    );
  });

  it("deve lançar erro se o ID não for fornecido", async () => {
    await expect(updateJobService.execute({} as any)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it("deve lançar erro se o serviço não for encontrado", async () => {
    vi.spyOn(dbMock, "get").mockResolvedValueOnce(undefined);

    await expect(
      updateJobService.execute({ id: "non-existent" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("deve lançar erro se o preço for inválido", async () => {
    vi.spyOn(dbMock, "get").mockResolvedValueOnce({ id: "123", name: "Teste" });
    await expect(
      updateJobService.execute({ id: "123", priceP: -10, priceM: -10, priceG: -10 }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });
});
