import type { Database } from "sqlite";
import type { IBookingResponse } from "../types/booking-types";

interface ListBookingsRequest {
    userId: string;
    userRole: string;
}

export class ListBookingsService {
    constructor(private db: Database) { }

    async execute({ userId, userRole }: ListBookingsRequest): Promise<IBookingResponse[]> {
        let query: string;
        let params: string[];

        if (userRole === "admin") {
            // Admin vê todos os agendamentos
            query = `
        SELECT 
          b.*,
          p.name as petName,
          j.name as jobName,
          u.name as userName
        FROM bookings b
        LEFT JOIN pets p ON b.petId = p.id
        LEFT JOIN jobs j ON b.jobId = j.id
        LEFT JOIN users u ON b.userId = u.id
        ORDER BY b.bookingDate DESC
      `;
            params = [];
        } else {
            // Cliente vê apenas seus agendamentos
            query = `
        SELECT 
          b.*,
          p.name as petName,
          j.name as jobName,
          u.name as userName
        FROM bookings b
        LEFT JOIN pets p ON b.petId = p.id
        LEFT JOIN jobs j ON b.jobId = j.id
        LEFT JOIN users u ON b.userId = u.id
        WHERE b.userId = ?
        ORDER BY b.bookingDate DESC
      `;
            params = [userId];
        }

        const bookings = await this.db.all(query, params);

        return bookings as IBookingResponse[];
    }
}
