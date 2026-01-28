import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Database } from "sqlite";
import { CancelBookingService } from "../services/cancel-booking-service";
import { BadRequestError } from "../../../errors/bad-request-error";
import { NotFoundError } from "../../../errors/not-found-error";

const dbMock = {
    get: vi.fn(),
    run: vi.fn(),
} as unknown as Database;

describe("CancelBookingService", () => {
    let cancelBookingService: CancelBookingService;

    beforeEach(() => {
        cancelBookingService = new CancelBookingService(dbMock);
        vi.clearAllMocks();
    });

    it("deve cancelar um agendamento futuro com sucesso", async () => {
        // Data futura (2026-12-31)
        vi.spyOn(dbMock, "get").mockResolvedValueOnce({
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
        expect(dbMock.run).toHaveBeenCalledWith(
            "UPDATE bookings SET status = 'cancelado' WHERE id = ?",
            ["booking-123"]
        );
    });

    it("deve permitir que admin cancele agendamento de outro usuário", async () => {
        vi.spyOn(dbMock, "get").mockResolvedValueOnce({
            id: "booking-123",
            userId: "outro-usuario",
            bookingDate: "2026-12-31 10:00",
            status: "agendado",
        });

        const result = await cancelBookingService.execute({
            bookingId: "booking-123",
            userId: "admin-user",
            userRole: "admin",
        });

        expect(result.status).toBe("cancelado");
    });

    it("deve lançar erro se o agendamento não existir", async () => {
        vi.spyOn(dbMock, "get").mockResolvedValueOnce(undefined);

        await expect(
            cancelBookingService.execute({
                bookingId: "inexistente",
                userId: "user-123",
                userRole: "client",
            })
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("deve lançar erro se cliente tentar cancelar agendamento de outro", async () => {
        vi.spyOn(dbMock, "get").mockResolvedValueOnce({
            id: "booking-123",
            userId: "outro-usuario",
            bookingDate: "2026-12-31 10:00",
            status: "agendado",
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
        vi.spyOn(dbMock, "get").mockResolvedValueOnce({
            id: "booking-123",
            userId: "user-123",
            bookingDate: "2026-12-31 10:00",
            status: "cancelado",
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
        vi.spyOn(dbMock, "get").mockResolvedValueOnce({
            id: "booking-123",
            userId: "user-123",
            bookingDate: "2026-12-31 10:00",
            status: "concluido",
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
        // Data no passado
        vi.spyOn(dbMock, "get").mockResolvedValueOnce({
            id: "booking-123",
            userId: "user-123",
            bookingDate: "2020-01-01 10:00",
            status: "agendado",
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
