import type { Request, Response } from "express";
import { BookingsRepository } from "../repositories/bookings-repository";

export class ListOccupiedSlotsController {
    static async handle(request: Request, response: Response) {
        const { startDate, endDate } = request.query;

        if (!startDate || !endDate) {
            return response.status(400).json({ message: "startDate e endDate são obrigatórios" });
        }

        const repository = new BookingsRepository();
        const slots = await repository.findOccupiedSlots(
            startDate as string,
            endDate as string
        );

        return response.json(slots);
    }
}
