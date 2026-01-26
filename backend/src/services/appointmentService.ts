import appointmentRepository from "../repositories/appointmentRepository.js";
import type { Iappointment } from "../types/appoitment.js";
import { validateAppointment } from "../utils/validators.js";

class appointmentService {
    public async findAll(): Promise<Iappointment[]> {
        return appointmentRepository.findAll();
    }

    public async save(appointment: Iappointment): Promise<void> {
        if (!validateAppointment(appointment)) {
            throw new Error("Dados inválidos");
        }
        await appointmentRepository.save(appointment);
    }

    public async update(appointment: Iappointment): Promise<void> {
        if (!validateAppointment(appointment)) {
            throw new Error("Dados inválidos");
        }
        await appointmentRepository.update(appointment);
    }

    public async delete(appointmentId: string): Promise<void> {
        await appointmentRepository.delete(appointmentId);
    }
}

export default new appointmentService();
