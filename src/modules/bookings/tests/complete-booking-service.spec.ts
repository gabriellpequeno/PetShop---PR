import { describe, it, expect, vi, beforeEach } from "vitest";
import { CompleteBookingService } from "../services/complete-booking-service";
import { UnauthorizedError } from "../../../errors/unauthorized-error";
import { BadRequestError } from "../../../errors/bad-request-error";
import type { BookingsRepository } from "../repositories/bookings-repository";

const repositoryMock = {
    findById: vi.fn(),
    complete: vi.fn(),
} as unknown as BookingsRepository;

describe("CompleteBookingService", () => {
    let completeService: CompleteBookingService;

    beforeEach(() => {
        completeService = new CompleteBookingService(repositoryMock);
        vi.clearAllMocks();
    });

    it("deve lançar erro se usuário não for admin", async () => {
        await expect(
            completeService.execute({ bookingId: "1", userRole: "client" })
        ).rejects.toBeInstanceOf(UnauthorizedError);
    });

    it("deve completar agendamento agendado quando admin", async () => {
        vi.spyOn(repositoryMock, "findById").mockResolvedValueOnce({
            id: "booking-1",
            status: "agendado",
            bookingDate: "2026-12-31",
            bookingTime: "10:00",
            price: 100,
        } as any);

        const result = await completeService.execute({ bookingId: "booking-1", userRole: "admin" });

        expect(repositoryMock.complete).toHaveBeenCalledWith("booking-1", null, null);
        expect(result.status).toBe("concluido");
    });

    it("deve permitir admin completar agendamento cancelado", async () => {
        vi.spyOn(repositoryMock, "findById").mockResolvedValueOnce({
            id: "booking-2",
            status: "cancelado",
            bookingDate: "2026-10-10",
            bookingTime: "11:00",
            price: 120,
        } as any);

        const result = await completeService.execute({ bookingId: "booking-2", userRole: "admin" });

        expect(repositoryMock.complete).toHaveBeenCalledWith("booking-2", null, null);
        expect(result.status).toBe("concluido");
    });

    it("deve negar completar agendamento cancelado para cliente", async () => {
        vi.spyOn(repositoryMock, "findById").mockResolvedValueOnce({
            id: "booking-3",
            status: "cancelado",
            bookingDate: "2026-10-10",
            bookingTime: "11:00",
            price: 90,
        } as any);

        await expect(
            completeService.execute({ bookingId: "booking-3", userRole: "client" })
        ).rejects.toBeInstanceOf(UnauthorizedError);
    });
});