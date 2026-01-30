import { db } from "@/database/db";
import { randomUUID } from "node:crypto";
import type {
  IBooking,
  IBookingCreate,
  IBookingResponse,
} from "../types/booking-types";

export class BookingsRepository {
  async create(data: IBookingCreate, price: number): Promise<IBooking> {
    const id = randomUUID();
    const now = new Date().toISOString();

    const booking: IBooking = {
      id,
      userId: data.userId,
      petId: data.petId,
      jobId: data.jobId,
      bookingDate: data.bookingDate,
      bookingTime: data.bookingTime,
      status: "agendado",
      price,
      realStartTime: null,
      realEndTime: null,
      createdAt: now,
    };

    await db.run(
      `INSERT INTO bookings (id, userId, petId, jobId, bookingDate, bookingTime, status, price, realStartTime, realEndTime, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        booking.id,
        booking.userId,
        booking.petId,
        booking.jobId,
        booking.bookingDate,
        booking.bookingTime,
        booking.status,
        booking.price,
        booking.realStartTime,
        booking.realEndTime,
        booking.createdAt,
      ],
    );

    return booking;
  }

  async findById(id: string): Promise<IBooking | undefined> {
    const booking = await db.get<IBooking>(
      "SELECT * FROM bookings WHERE id = ?",
      [id],
    );
    return booking;
  }

  async findDuplicate(
    petId: string,
    jobId: string,
    bookingDate: string,
    bookingTime: string,
  ): Promise<IBooking | undefined> {
    const booking = await db.get<IBooking>(
      `SELECT id FROM bookings 
       WHERE petId = ? AND jobId = ? AND bookingDate = ? AND bookingTime = ? AND status != 'cancelado'`,
      [petId, jobId, bookingDate, bookingTime],
    );
    return booking;
  }

  async findByUserId(userId: string): Promise<IBookingResponse[]> {
    const bookings = await db.all<IBookingResponse[]>(
      `SELECT 
        b.*,
        p.name as petName,
        p.size as petSize,
        j.name as jobName,
        j.duration as jobDuration,
        u.name as userName
      FROM bookings b
      LEFT JOIN pets p ON b.petId = p.id
      LEFT JOIN jobs j ON b.jobId = j.id
      LEFT JOIN users u ON b.userId = u.id
      WHERE b.userId = ?
      ORDER BY b.bookingDate DESC`,
      [userId],
    );
    return bookings;
  }

  async findAll(): Promise<IBookingResponse[]> {
    const bookings = await db.all<IBookingResponse[]>(
      `SELECT 
        b.*,
        p.name as petName,
        p.size as petSize,
        j.name as jobName,
        j.duration as jobDuration,
        u.name as userName
      FROM bookings b
      LEFT JOIN pets p ON b.petId = p.id
      LEFT JOIN jobs j ON b.jobId = j.id
      LEFT JOIN users u ON b.userId = u.id
      ORDER BY b.bookingDate DESC`,
    );
    return bookings;
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await db.run("UPDATE bookings SET status = ? WHERE id = ?", [status, id]);
  }

  async complete(
    id: string,
    realStartTime: string,
    realEndTime: string,
  ): Promise<void> {
    await db.run(
      `UPDATE bookings 
       SET status = 'concluido', realStartTime = ?, realEndTime = ? 
       WHERE id = ?`,
      [realStartTime, realEndTime, id],
    );
  }

  async findOccupiedSlots(
    startDate: string,
    endDate: string,
  ): Promise<{ bookingDate: string; bookingTime: string; jobId: string }[]> {
    const slots = await db.all<
      { bookingDate: string; bookingTime: string; jobId: string }[]
    >(
      `SELECT bookingDate, bookingTime, jobId
             FROM bookings 
             WHERE bookingDate >= ? AND bookingDate <= ? AND status != 'cancelado'`,
      [startDate, endDate],
    );
    return slots;
  }

  async deleteByUserId(userId: string): Promise<void> {
    await db.run("DELETE FROM bookings WHERE userId = ?", [userId]);
  }
}
