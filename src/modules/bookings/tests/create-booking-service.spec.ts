import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateBookingService } from "../services/create-booking-service";
import { BadRequestError } from "../../../errors/bad-request-error";
import { NotFoundError } from "../../../errors/not-found-error";
import { ConflictError } from "../../../errors/conflict-error";
import type { BookingsRepository } from "../repositories/bookings-repository";
import type { PetsRepository } from "../../pets/repositories/pets-repository";
import type { JobsRepository } from "../../jobs/repositories/jobs-repository";

// Mocks dos repositories
const bookingsRepositoryMock = {
    create: vi.fn(),
    findDuplicate: vi.fn(),
} as unknown as BookingsRepository;

const petsRepositoryMock = {
    findById: vi.fn(),
} as unknown as PetsRepository;

const jobsRepositoryMock = {
    findById: vi.fn(),
} as unknown as JobsRepository;

describe("CreateBookingService", () => {
    let createBookingService: CreateBookingService;

    beforeEach(() => {
        createBookingService = new CreateBookingService(
            bookingsRepositoryMock,
            petsRepositoryMock,
            jobsRepositoryMock
        );
        vi.clearAllMocks();
    });

    it("deve criar um agendamento com sucesso", async () => {
        vi.spyOn(petsRepositoryMock, "findById").mockResolvedValueOnce({
            id: "pet-123",
            userId: "user-123",
            name: "Rex",
            species: "Cachorro",
            breed: null,
            age: null,
            weight: null,
            size: "M",
        });
        vi.spyOn(jobsRepositoryMock, "findById").mockResolvedValueOnce({
            id: "job-123",
            name: "Banho",
            description: "",
            priceP: 50,
            priceM: 60,
            priceG: 70,
            duration: 30,
            availability: [
                { id: "av1", jobId: "job-123", dayOfWeek: 0, startTime: "09:00", endTime: "18:00" }
            ]
        });
        vi.spyOn(bookingsRepositoryMock, "findDuplicate").mockResolvedValueOnce(undefined);
        vi.spyOn(bookingsRepositoryMock, "create").mockResolvedValueOnce({
            id: "booking-123",
            userId: "user-123",
            petId: "pet-123",
            jobId: "job-123",
            bookingDate: "2026-02-15",
            bookingTime: "10:00",
            status: "agendado",
            price: 60,
            realStartTime: null,
            realEndTime: null,
            createdAt: "2026-01-28T00:00:00Z",
        });

        const booking = await createBookingService.execute({
            userId: "user-123",
            userRole: "client",
            petId: "pet-123",
            jobId: "job-123",
            bookingDate: "2026-02-15",
            bookingTime: "10:00",
        });

        expect(booking.id).toBeDefined();
        expect(booking.status).toBe("agendado");
        expect(bookingsRepositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: "user-123",
                petId: "pet-123",
                jobId: "job-123",
            }),
            60 // price for M size
        );
    });

    it("deve lançar erro se a data estiver em formato inválido", async () => {
        await expect(
            createBookingService.execute({
                userId: "user-123",
                userRole: "client",
                petId: "pet-123",
                jobId: "job-123",
                bookingDate: "15/02/2026",
                bookingTime: "10:00",
            })
        ).rejects.toBeInstanceOf(BadRequestError);
    });

    it("deve lançar erro se a data estiver vazia", async () => {
        await expect(
            createBookingService.execute({
                userId: "user-123",
                userRole: "client",
                petId: "pet-123",
                jobId: "job-123",
                bookingDate: "",
                bookingTime: "10:00",
            })
        ).rejects.toBeInstanceOf(BadRequestError);
    });

    it("deve lançar erro se o pet não existir", async () => {
        vi.spyOn(petsRepositoryMock, "findById").mockResolvedValueOnce(undefined);

        await expect(
            createBookingService.execute({
                userId: "user-123",
                userRole: "client",
                petId: "pet-inexistente",
                jobId: "job-123",
                bookingDate: "2026-02-15",
                bookingTime: "10:00",
            })
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("deve lançar erro se o pet não pertencer ao usuário", async () => {
        vi.spyOn(petsRepositoryMock, "findById").mockResolvedValueOnce({
            id: "pet-123",
            userId: "outro-usuario",
            name: "Rex",
            species: "Cachorro",
            breed: null,
            age: null,
            weight: null,
            size: "M",
        });

        await expect(
            createBookingService.execute({
                userId: "user-123",
                userRole: "client",
                petId: "pet-123",
                jobId: "job-123",
                bookingDate: "2026-02-15",
                bookingTime: "10:00",
            })
        ).rejects.toBeInstanceOf(BadRequestError);
    });

    it("deve lançar erro se o job não existir", async () => {
        vi.spyOn(petsRepositoryMock, "findById").mockResolvedValueOnce({
            id: "pet-123",
            userId: "user-123",
            name: "Rex",
            species: "Cachorro",
            breed: null,
            age: null,
            weight: null,
            size: "M",
        });
        vi.spyOn(jobsRepositoryMock, "findById").mockResolvedValueOnce(undefined);

        await expect(
            createBookingService.execute({
                userId: "user-123",
                userRole: "client",
                petId: "pet-123",
                jobId: "job-inexistente",
                bookingDate: "2026-02-15",
                bookingTime: "10:00",
            })
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("deve lançar erro se já existir agendamento duplicado", async () => {
        vi.spyOn(petsRepositoryMock, "findById").mockResolvedValueOnce({
            id: "pet-123",
            userId: "user-123",
            name: "Rex",
            species: "Cachorro",
            breed: null,
            age: null,
            weight: null,
            size: "M",
        });
        vi.spyOn(jobsRepositoryMock, "findById").mockResolvedValueOnce({
            id: "job-123",
            name: "Banho",
            description: "",
            priceP: 50,
            priceM: 60,
            priceG: 70,
            duration: 30,
            availability: [
                { id: "av1", jobId: "job-123", dayOfWeek: 0, startTime: "09:00", endTime: "18:00" }
            ]
        });
        vi.spyOn(bookingsRepositoryMock, "findDuplicate").mockResolvedValueOnce({
            id: "booking-existente",
            userId: "user-123",
            petId: "pet-123",
            jobId: "job-123",
            bookingDate: "2026-02-15",
            bookingTime: "10:00",
            status: "agendado",
            price: 60,
            realStartTime: null,
            realEndTime: null,
            createdAt: "2026-01-28T00:00:00Z",
        });

        await expect(
            createBookingService.execute({
                userId: "user-123",
                userRole: "client",
                petId: "pet-123",
                jobId: "job-123",
                bookingDate: "2026-02-15",
                bookingTime: "10:00",
            })
        ).rejects.toBeInstanceOf(ConflictError);
    });

    it("deve permitir que admin crie agendamento para pet de outro usuário", async () => {
        vi.spyOn(petsRepositoryMock, "findById").mockResolvedValueOnce({
            id: "pet-123",
            userId: "dono-do-pet",
            name: "Rex",
            species: "Cachorro",
            breed: null,
            age: null,
            weight: null,
            size: "G",
        });
        vi.spyOn(jobsRepositoryMock, "findById").mockResolvedValueOnce({
            id: "job-123",
            name: "Banho",
            description: "",
            priceP: 50,
            priceM: 60,
            priceG: 70,
            duration: 30,
            availability: [
                { id: "av1", jobId: "job-123", dayOfWeek: 0, startTime: "09:00", endTime: "18:00" }
            ]
        });
        vi.spyOn(bookingsRepositoryMock, "findDuplicate").mockResolvedValueOnce(undefined);
        vi.spyOn(bookingsRepositoryMock, "create").mockResolvedValueOnce({
            id: "booking-admin",
            userId: "dono-do-pet",
            petId: "pet-123",
            jobId: "job-123",
            bookingDate: "2026-02-15",
            bookingTime: "10:00",
            status: "agendado",
            price: 70,
            realStartTime: null,
            realEndTime: null,
            createdAt: "2026-01-28T00:00:00Z",
        });

        await createBookingService.execute({
            userId: "admin-id",
            userRole: "admin",
            petId: "pet-123",
            jobId: "job-123",
            bookingDate: "2026-02-15",
            bookingTime: "10:00",
        });

        expect(bookingsRepositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: "dono-do-pet"
            }),
            70 // price for G size
        );
    });
});
