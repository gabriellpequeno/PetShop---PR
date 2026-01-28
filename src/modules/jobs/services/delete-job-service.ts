import { Database } from "sqlite";
import { NotFoundError } from "../../../errors/not-found-error";
// import { ConflictError } from "../../../errors/conflict-error";
// TODO: Importar ConflictError quando a validação de bookings for implementada

export class DeleteJobService {
  constructor(private db: Database) {}

  async execute(id: string) {
    // Verificar se o serviço existe
    const job = await this.db.get("SELECT id FROM jobs WHERE id = ?", [id]);

    if (!job) {
      throw new NotFoundError("Serviço não encontrado.");
    }

    // TODO: Verificar se há agendamentos futuros para este serviço
    // const hasBookings = await this.db.get(
    //   "SELECT id FROM bookings WHERE service_id = ? AND scheduled_date > datetime('now')",
    //   [id]
    // );
    // if (hasBookings) {
    //   throw new ConflictError("Não é possível excluir um serviço com agendamentos futuros.");
    // }

    await this.db.run("DELETE FROM jobs WHERE id = ?", [id]);
  }
}
