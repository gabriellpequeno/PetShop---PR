import type { Request, Response } from "express";
import { DeleteUserService } from "../services/delete-user-service";
import { UsersRepository } from "../repositories/users-repository";
import { PetsRepository } from "@/modules/pets/repositories/pets-repository";
import { BookingsRepository } from "@/modules/bookings/repositories/bookings-repository";

export class DeleteUserController {
  static async handle(request: Request, response: Response) {
    const role = request.user.role;
    const { id } = request.params;

    if (typeof id !== "string") {
      throw new Error("User ID is required and must be a string");
    }

    const usersRepository = new UsersRepository();
    const petsRepository = new PetsRepository();
    const bookingsRepository = new BookingsRepository();
    const deleteUserService = new DeleteUserService(
      usersRepository,
      petsRepository,
      bookingsRepository,
    );

    await deleteUserService.execute({ role, userId: id });

    return response.status(204).send();
  }
}
