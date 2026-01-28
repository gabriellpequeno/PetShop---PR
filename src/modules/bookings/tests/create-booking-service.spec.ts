import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Database } from "sqlite";
import { CreateBookingService } from "../services/create-booking-service";
import { BadRequestError } from "../../../errors/bad-request-error";
import { NotFoundError } from "../../../errors/not-found-error";
import { ConflictError } from "../../../errors/conflict-error";

const dbMock = {
    get: vi.fn(),
    run: vi.fn(),
} as unknown as Database;

describe("CreateBookingService", () => {
    let createBookingService: CreateBookingService;

    beforeEach(() => {
        createBookingService = new CreateBookingService(dbMock);
        vi.clearAllMocks();
    });

    it("deve criar um agendamento com sucesso", async () => {
        // Mock: pet existe e pertence ao usuário
        vi.spyOn(dbMock, "get")
            .mockResolvedValueOnce({ id: "pet-123", userId: "user-123" }) // pet
            .mockResolvedValueOnce({ id: "job-123" }) // job
            .mockResolvedValueOnce(undefined); // sem duplicidade

        const booking = await createBookingService.execute({
            userId: "user-123",
            petId: "pet-123",
            jobId: "job-123",
            bookingDate: "2026-02-15 10:00",
        });

        expect(booking.id).toBeDefined();
        expect(booking.userId).toBe("user-123");
        expect(booking.petId).toBe("pet-123");
        expect(booking.jobId).toBe("job-123");
        expect(booking.status).toBe("agendado");
        expect(dbMock.run).toHaveBeenCalled();
    });

    it("deve lançar erro se a data estiver em formato inválido", async () => {
        await expect(
            createBookingService.execute({
                userId: "user-123",
                petId: "pet-123",
                jobId: "job-123",
                bookingDate: "15/02/2026 10:00", // formato errado
            })
        ).rejects.toBeInstanceOf(BadRequestError);
    });

    it("deve lançar erro se a data estiver vazia", async () => {
        await expect(
            createBookingService.execute({
                userId: "user-123",
                petId: "pet-123",
                jobId: "job-123",
                bookingDate: "",
            })
        ).rejects.toBeInstanceOf(BadRequestError);
    });

    it("deve lançar erro se o pet não existir", async () => {
        vi.spyOn(dbMock, "get").mockResolvedValueOnce(undefined);

        await expect(
            createBookingService.execute({
                userId: "user-123",
                petId: "pet-inexistente",
                jobId: "job-123",
                bookingDate: "2026-02-15 10:00",
            })
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("deve lançar erro se o pet não pertencer ao usuário", async () => {
        vi.spyOn(dbMock, "get").mockResolvedValueOnce({
            id: "pet-123",
            userId: "outro-usuario",
        });

        await expect(
            createBookingService.execute({
                userId: "user-123",
                petId: "pet-123",
                jobId: "job-123",
                bookingDate: "2026-02-15 10:00",
            })
        ).rejects.toBeInstanceOf(BadRequestError);
    });

    it("deve lançar erro se o job não existir", async () => {
        vi.spyOn(dbMock, "get")
            .mockResolvedValueOnce({ id: "pet-123", userId: "user-123" })
            .mockResolvedValueOnce(undefined); // job não existe

        await expect(
            createBookingService.execute({
                userId: "user-123",
                petId: "pet-123",
                jobId: "job-inexistente",
                bookingDate: "2026-02-15 10:00",
            })
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("deve lançar erro se já existir agendamento duplicado", async () => {
        vi.spyOn(dbMock, "get")
            .mockResolvedValueOnce({ id: "pet-123", userId: "user-123" })
            .mockResolvedValueOnce({ id: "job-123" })
            .mockResolvedValueOnce({ id: "booking-existente" }); // duplicidade

        await expect(
            createBookingService.execute({
                userId: "user-123",
                petId: "pet-123",
                jobId: "job-123",
                bookingDate: "2026-02-15 10:00",
            })
        ).rejects.toBeInstanceOf(ConflictError);
    });
});
