import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateJobService } from "../services/create-job-service";
import { BadRequestError } from "../../../errors/bad-request-error";
import { ConflictError } from "../../../errors/conflict-error";
import type { JobsRepository } from "../repositories/jobs-repository";

// Mock do repository
const repositoryMock = {
    create: vi.fn(),
    findByName: vi.fn(),
} as unknown as JobsRepository;

describe("CreateJobService", () => {
    let createJobService: CreateJobService;

    beforeEach(() => {
        createJobService = new CreateJobService(repositoryMock);
        vi.clearAllMocks();
    });

    it("deve criar um serviço com sucesso", async () => {
        vi.spyOn(repositoryMock, "findByName").mockResolvedValueOnce(undefined);
        vi.spyOn(repositoryMock, "create").mockResolvedValueOnce({
            id: "job-123",
            name: "Banho",
            description: "Banho completo",
            priceP: 50,
            priceM: 60,
            priceG: 70,
            duration: 30,
        });

        const result = await createJobService.execute({
            name: "Banho",
            description: "Banho completo",
            priceP: 50,
            priceM: 60,
            priceG: 70,
            duration: 30,
        });

        expect(result).toHaveProperty("id");
        expect(result.name).toBe("Banho");
        expect(repositoryMock.create).toHaveBeenCalled();
    });

    it("deve lançar erro se o nome do serviço for curto demais", async () => {
        await expect(
            createJobService.execute({
                name: "Ba",
                description: "Banho",
                priceP: 50,
                priceM: 60,
                priceG: 70,
                duration: 30,
            })
        ).rejects.toBeInstanceOf(BadRequestError);
    });

    it("deve lançar erro se o preço for inválido (menor ou igual a zero)", async () => {
        await expect(
            createJobService.execute({
                name: "Banho",
                description: "Banho",
                priceP: 0,
                priceM: 60,
                priceG: 70,
                duration: 30,
            })
        ).rejects.toBeInstanceOf(BadRequestError);
    });

    it("deve lançar erro se a duração for inválida (menor ou igual a zero)", async () => {
        await expect(
            createJobService.execute({
                name: "Banho",
                description: "Banho",
                priceP: 50,
                priceM: 60,
                priceG: 70,
                duration: 0,
            })
        ).rejects.toBeInstanceOf(BadRequestError);
    });

    it("deve lançar erro se já existir um serviço com o mesmo nome", async () => {
        vi.spyOn(repositoryMock, "findByName").mockResolvedValueOnce({
            id: "job-existente",
            name: "Banho",
            description: "Descrição",
            priceP: 50,
            priceM: 60,
            priceG: 70,
            duration: 30,
        });

        await expect(
            createJobService.execute({
                name: "Banho",
                description: "Outra descrição",
                priceP: 55,
                priceM: 65,
                priceG: 75,
                duration: 45,
            })
        ).rejects.toBeInstanceOf(ConflictError);
    });
});
