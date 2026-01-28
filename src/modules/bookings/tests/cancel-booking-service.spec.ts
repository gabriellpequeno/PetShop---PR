import { describe, it, expect, vi, beforeEach } from "vitest";
import { CancelBookingService } from "../services/cancel-booking-service";
import { BadRequestError } from "../../../errors/bad-request-error";
import { NotFoundError } from "../../../errors/not-found-error";
import type { BookingsRepository } from "../repositories/bookings-repository";

// Mock do repository
const repositoryMock = {
    findById: vi.fn(),
    updateStatus: vi.fn(),
} as unknown as BookingsRepository;

describe("CancelBookingService", () => {
    let cancelBookingService: CancelBookingService;

    beforeEach(() => {
        cancelBookingService = new CancelBookingService(repositoryMock);
        vi.clearAllMocks();
    });

    it("deve cancelar um agendamento futuro com sucesso", async () => {
        vi.spyOn(repositoryMock, "findById").mockResolvedValueOnce({
            id: "booking-123",
            userId: "user-123",
            petId: "pet-123",
            jobId: "job-123",
            bookingDate: "2026-12-31 10:00",
            status: "agendado",
            realStartTime: null,
            realEndTime: null,
            createdAt: "2026-01-01T00:00:00Z",
        });

        const result = await cancelBookingService.execute({
            bookingId: "booking-123",
            userId: "user-123",
            userRole: "client",
        });

        expect(result.status).toBe("cancelado");
        expect(repositoryMock.updateStatus).toHaveBeenCalledWith(
            "booking-123",
            "cancelado"
        );
    });

    it("deve permitir que admin cancele agendamento de outro usuário", async () => {
        vi.spyOn(repositoryMock, "findById").mockResolvedValueOnce({
            id: "booking-123",
            userId: "outro-usuario",
            petId: "pet-123",
            jobId: "job-123",
            bookingDate: "2026-12-31 10:00",
            status: "agendado",
            realStartTime: null,
            realEndTime: null,
            createdAt: "2026-01-01T00:00:00Z",
        });

        const result = await cancelBookingService.execute({
            bookingId: "booking-123",
            userId: "admin-user",
            userRole: "admin",
        });

        expect(result.status).toBe("cancelado");
    });

    it("deve lançar erro se o agendamento não existir", async () => {
        vi.spyOn(repositoryMock, "findById").mockResolvedValueOnce(undefined);

        await expect(
            cancelBookingService.execute({
                bookingId: "inexistente",
                userId: "user-123",
                userRole: "client",
            })
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("deve lançar erro se cliente tentar cancelar agendamento de outro", async () => {
        vi.spyOn(repositoryMock, "findById").mockResolvedValueOnce({
            id: "booking-123",
            userId: "outro-usuario",
            petId: "pet-123",
            jobId: "job-123",
            bookingDate: "2026-12-31 10:00",
            status: "agendado",
            realStartTime: null,
            realEndTime: null,
            createdAt: "2026-01-01T00:00:00Z",
        });

        await expect(
            cancelBookingService.execute({
                bookingId: "booking-123",
                userId: "user-123",
                userRole: "client",
            })
        ).rejects.toBeInstanceOf(BadRequestError);
    });

    it("deve lançar erro se o agendamento já foi cancelado", async () => {
        vi.spyOn(repositoryMock, "findById").mockResolvedValueOnce({
            id: "booking-123",
            userId: "user-123",
            petId: "pet-123",
            jobId: "job-123",
            bookingDate: "2026-12-31 10:00",
            status: "cancelado",
            realStartTime: null,
            realEndTime: null,
            createdAt: "2026-01-01T00:00:00Z",
        });

        await expect(
            cancelBookingService.execute({
                bookingId: "booking-123",
                userId: "user-123",
                userRole: "client",
            })
        ).rejects.toBeInstanceOf(BadRequestError);
    });

    it("deve lançar erro se o agendamento já foi concluído", async () => {
        vi.spyOn(repositoryMock, "findById").mockResolvedValueOnce({
            id: "booking-123",
            userId: "user-123",
            petId: "pet-123",
            jobId: "job-123",
            bookingDate: "2026-12-31 10:00",
            status: "concluido",
            realStartTime: null,
            realEndTime: null,
            createdAt: "2026-01-01T00:00:00Z",
        });

        await expect(
            cancelBookingService.execute({
                bookingId: "booking-123",
                userId: "user-123",
                userRole: "client",
            })
        ).rejects.toBeInstanceOf(BadRequestError);
    });

    it("deve lançar erro se tentar cancelar agendamento passado", async () => {
        vi.spyOn(repositoryMock, "findById").mockResolvedValueOnce({
            id: "booking-123",
            userId: "user-123",
            petId: "pet-123",
            jobId: "job-123",
            bookingDate: "2020-01-01 10:00",
            status: "agendado",
            realStartTime: null,
            realEndTime: null,
            createdAt: "2019-12-01T00:00:00Z",
        });

        await expect(
            cancelBookingService.execute({
                bookingId: "booking-123",
                userId: "user-123",
                userRole: "client",
            })
        ).rejects.toBeInstanceOf(BadRequestError);
    });
});
