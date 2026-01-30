import type { Request, Response } from "express";
import { BookingsRepository } from "../repositories/bookings-repository";
import { BadRequestError } from "../../../errors/bad-request-error";
import { UnauthorizedError } from "../../../errors/unauthorized-error";
import { NotFoundError } from "../../../errors/not-found-error";

export class UpdateBookingStatusController {
  static async handle(request: Request, response: Response) {
    const { id } = request.params;
    const { status } = request.body;
    const userRole = request.user.role;

    if (userRole !== "admin") {
      throw new UnauthorizedError(
        "Apenas administradores podem alterar o status de agendamentos.",
      );
    }

    if (!id || typeof id !== "string") {
      throw new BadRequestError("ID do agendamento é obrigatório.");
    }

    if (!status || !["agendado", "concluido", "cancelado"].includes(status)) {
      throw new BadRequestError("Status inválido.");
    }

    const repository = new BookingsRepository();
    const booking = await repository.findById(id);

    if (!booking) {
      throw new NotFoundError("Agendamento não encontrado.");
    }

    await repository.updateStatus(id, status);

    return response.json({ ...booking, status });
  }
}
