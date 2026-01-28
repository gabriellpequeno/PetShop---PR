import type { BookingsRepository } from "../repositories/bookings-repository";
import type { IBookingResponse } from "../types/booking-types";

interface ListBookingsRequest {
  userId: string;
  userRole: string;
}

export class ListBookingsService {
  constructor(private repository: BookingsRepository) { }

  async execute({ userId, userRole }: ListBookingsRequest): Promise<IBookingResponse[]> {
    if (userRole === "admin") {
      return this.repository.findAll();
    }
    return this.repository.findByUserId(userId);
  }
}
