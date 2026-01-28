import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateJobService } from "../services/update-job-service";
import { BadRequestError } from "../../../errors/bad-request-error";
import { NotFoundError } from "../../../errors/not-found-error";
import type { JobsRepository } from "../repositories/jobs-repository";
import type { Job } from "../models/job";

// Mock do repository
const repositoryMock = {
  findById: vi.fn(),
  update: vi.fn(),
} as unknown as JobsRepository;

describe("UpdateJobService", () => {
  let updateJobService: UpdateJobService;

  beforeEach(() => {
    updateJobService = new UpdateJobService(repositoryMock);
    vi.clearAllMocks();
  });

  it("deve atualizar um serviço com sucesso", async () => {
    const existingJob: Job = {
      id: "job-123",
      name: "Banho",
      description: "Banho completo",
      priceP: 50,
      priceM: 60,
      priceG: 70,
      duration: 30,
    };

    vi.spyOn(repositoryMock, "findById").mockResolvedValueOnce(existingJob);
    vi.spyOn(repositoryMock, "update").mockResolvedValueOnce({
      ...existingJob,
      name: "Banho Premium",
      priceP: 80,
    });

    const result = await updateJobService.execute({
      id: "job-123",
      name: "Banho Premium",
      priceP: 80,
    });

    expect(repositoryMock.findById).toHaveBeenCalledWith("job-123");
    expect(repositoryMock.update).toHaveBeenCalled();
  });

  it("deve lançar erro se o ID não for fornecido", async () => {
    await expect(updateJobService.execute({} as any)).rejects.toBeInstanceOf(
      BadRequestError
    );
  });

  it("deve lançar erro se o serviço não for encontrado", async () => {
    vi.spyOn(repositoryMock, "findById").mockResolvedValueOnce(undefined);

    await expect(
      updateJobService.execute({ id: "non-existent" })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("deve lançar erro se o preço for inválido", async () => {
    vi.spyOn(repositoryMock, "findById").mockResolvedValueOnce({
      id: "123",
      name: "Teste",
      description: "",
      priceP: 50,
      priceM: 60,
      priceG: 70,
      duration: 30,
    });

    await expect(
      updateJobService.execute({ id: "123", priceP: -10 })
    ).rejects.toBeInstanceOf(BadRequestError);
  });
});
