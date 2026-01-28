import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeleteJobService } from "../services/delete-job-service";
import { BadRequestError } from "../../../errors/bad-request-error";
import { NotFoundError } from "../../../errors/not-found-error";
import type { JobsRepository } from "../repositories/jobs-repository";

// Mock do repository
const repositoryMock = {
  findById: vi.fn(),
  delete: vi.fn(),
} as unknown as JobsRepository;

describe("DeleteJobService", () => {
  let deleteJobService: DeleteJobService;

  beforeEach(() => {
    deleteJobService = new DeleteJobService(repositoryMock);
    vi.clearAllMocks();
  });

  it("deve deletar um serviço com sucesso", async () => {
    vi.spyOn(repositoryMock, "findById").mockResolvedValueOnce({
      id: "job-123",
      name: "Banho",
      description: "",
      priceP: 50,
      priceM: 60,
      priceG: 70,
      duration: 30,
    });

    await deleteJobService.execute("job-123");

    expect(repositoryMock.findById).toHaveBeenCalledWith("job-123");
    expect(repositoryMock.delete).toHaveBeenCalledWith("job-123");
  });

  it("deve lançar erro se o ID não for fornecido", async () => {
    await expect(deleteJobService.execute("")).rejects.toBeInstanceOf(
      BadRequestError
    );
  });

  it("deve lançar erro se o serviço não for encontrado", async () => {
    vi.spyOn(repositoryMock, "findById").mockResolvedValueOnce(undefined);

    await expect(
      deleteJobService.execute("non-existent")
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
