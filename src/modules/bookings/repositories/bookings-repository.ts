import { db } from "@/database/db";
import { randomUUID } from "node:crypto";
import type { IBooking, IBookingCreate, IBookingResponse } from "../types/booking-types";

export class BookingsRepository {
    async create(data: IBookingCreate): Promise<IBooking> {
        const id = randomUUID();
        const now = new Date().toISOString();

        const booking: IBooking = {
            id,
            userId: data.userId,
            petId: data.petId,
            jobId: data.jobId,
            bookingDate: data.bookingDate,
            status: "agendado",
            realStartTime: null,
            realEndTime: null,
            createdAt: now,
        };

        await db.run(
            `INSERT INTO bookings (id, userId, petId, jobId, bookingDate, status, realStartTime, realEndTime, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                booking.id,
                booking.userId,
                booking.petId,
                booking.jobId,
                booking.bookingDate,
                booking.status,
                booking.realStartTime,
                booking.realEndTime,
                booking.createdAt,
            ]
        );

        return booking;
    }

    async findById(id: string): Promise<IBooking | undefined> {
        const booking = await db.get<IBooking>(
            "SELECT * FROM bookings WHERE id = ?",
            [id]
        );
        return booking;
    }

    async findDuplicate(
        petId: string,
        jobId: string,
        bookingDate: string
    ): Promise<IBooking | undefined> {
        const booking = await db.get<IBooking>(
            `SELECT id FROM bookings 
       WHERE petId = ? AND jobId = ? AND bookingDate = ? AND status != 'cancelado'`,
            [petId, jobId, bookingDate]
        );
        return booking;
    }

    async findByUserId(userId: string): Promise<IBookingResponse[]> {
        const bookings = await db.all<IBookingResponse[]>(
            `SELECT 
        b.*,
        p.name as petName,
        j.name as jobName,
        u.name as userName
      FROM bookings b
      LEFT JOIN pets p ON b.petId = p.id
      LEFT JOIN jobs j ON b.jobId = j.id
      LEFT JOIN users u ON b.userId = u.id
      WHERE b.userId = ?
      ORDER BY b.bookingDate DESC`,
            [userId]
        );
        return bookings;
    }

    async findAll(): Promise<IBookingResponse[]> {
        const bookings = await db.all<IBookingResponse[]>(
            `SELECT 
        b.*,
        p.name as petName,
        j.name as jobName,
        u.name as userName
      FROM bookings b
      LEFT JOIN pets p ON b.petId = p.id
      LEFT JOIN jobs j ON b.jobId = j.id
      LEFT JOIN users u ON b.userId = u.id
      ORDER BY b.bookingDate DESC`
        );
        return bookings;
    }

    async updateStatus(id: string, status: string): Promise<void> {
        await db.run("UPDATE bookings SET status = ? WHERE id = ?", [status, id]);
    }

    async complete(
        id: string,
        realStartTime: string,
        realEndTime: string
    ): Promise<void> {
        await db.run(
            `UPDATE bookings 
       SET status = 'concluido', realStartTime = ?, realEndTime = ? 
       WHERE id = ?`,
            [realStartTime, realEndTime, id]
        );
    }
}
