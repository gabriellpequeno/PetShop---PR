import type { BookingsRepository } from "../repositories/bookings-repository";
import type { IBookingResponse } from "../types/booking-types";

interface ListBookingsRequest {
  userId: string;
  userRole: string;
  targetUserId?: string | undefined;
}

export class ListBookingsService {
  constructor(private repository: BookingsRepository) { }

  async execute({ userId, userRole, targetUserId }: ListBookingsRequest): Promise<IBookingResponse[]> {
    if (userRole === "admin") {
      if (targetUserId) {
        return this.repository.findByUserId(targetUserId);
      }
      return this.repository.findAll();
    }
    return this.repository.findByUserId(userId);
  }
}
