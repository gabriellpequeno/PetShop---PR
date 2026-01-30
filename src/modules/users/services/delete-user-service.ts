import type { UsersRepository } from "../repositories/users-repository";
import type { PetsRepository } from "@/modules/pets/repositories/pets-repository";
import type { BookingsRepository } from "@/modules/bookings/repositories/bookings-repository";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import { NotFoundError } from "@/errors/not-found-error";

type Request = {
  role: string;
  userId: string;
};

export class DeleteUserService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly petsRepository?: PetsRepository,
    private readonly bookingsRepository?: BookingsRepository,
  ) {}

  async execute({ role, userId }: Request) {
    if (role !== "admin") {
      throw new UnauthorizedError(
        "Apenas administradores podem acessar esta funcionalidade",
      );
    }

    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }

    // Cascade delete: first delete bookings, then pets, then user
    if (this.bookingsRepository) {
      await this.bookingsRepository.deleteByUserId(userId);
    }

    if (this.petsRepository) {
      await this.petsRepository.deleteByUserId(userId);
    }

    await this.usersRepository.delete(userId);

    return true;
  }
}
