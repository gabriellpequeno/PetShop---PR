import db from "../utils/database.js";
import { v4 as uuid } from "uuid";
import { Iappointment } from "../types/appoitment.js";
import { validateAppointment } from "../utils/validators.js";

class appointmentRepository {
    public async findAll(): Promise<Iappointment[]> {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM appointments", (err: Error | null, rows: Iappointment[]) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    public async findByUserId(userId: string): Promise<Iappointment | null> {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM appointments WHERE user_id = ?", [userId], (err: Error | null, row: Iappointment | undefined) => {
                if (err) return reject(err);
                resolve(row || null);
            });
        });
    }

    public async findByServiceId(serviceId: string): Promise<Iappointment | null> {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM appointments WHERE service_id = ?", [serviceId], (err: Error | null, row: Iappointment | undefined) => {
                if (err) return reject(err);
                resolve(row || null);
            });
        });
    }

    public async findByPetId(petId: string): Promise<Iappointment | null> {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM appointments WHERE pet_id = ?", [petId], (err: Error | null, row: Iappointment | undefined) => {
                if (err) return reject(err);
                resolve(row || null);
            });
        });
    }

    public async save(appointment: Iappointment): Promise<void> {
        return new Promise((resolve, reject) => {
            const newAppointment: Partial<Iappointment> = appointment;
            if (!newAppointment.userId || !newAppointment.serviceId || !newAppointment.petId || !newAppointment.price || !newAppointment.date || !newAppointment.time || !newAppointment.status) {
                throw new Error("Dados inválidos");
            }
            if (!validateAppointment(appointment)) {
                throw new Error("Dados inválidos");
            }
            newAppointment.appointmentId = uuid();

            const sql = "INSERT INTO appointments (user_id, service_id, pet_id, price, date, time, status) VALUES (?, ?, ?, ?, ?, ?, ?)";

            db.run(sql, [newAppointment.userId, newAppointment.serviceId, newAppointment.petId, newAppointment.price, newAppointment.date, newAppointment.time, newAppointment.status], (err: Error | null) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    public async update(appointment: Iappointment): Promise<void> {
        return new Promise((resolve, reject) => {
            const { userId, serviceId, petId, price, date, time, status } = appointment;
            if (!userId || !serviceId || !petId || !price || !date || !time || !status) {
                throw new Error("Dados inválidos");
            }
            if (!validateAppointment(appointment)) {
                throw new Error("Dados inválidos");
            }

            const values = []
            const fields = []
            if (userId) {
                values.push(userId)
                fields.push("user_id = ?")
            }
            if (serviceId) {
                values.push(serviceId)
                fields.push("service_id = ?")
            }
            if (petId) {
                values.push(petId)
                fields.push("pet_id = ?")
            }
            if (price) {
                values.push(price)
                fields.push("price = ?")
            }
            if (date) {
                values.push(date)
                fields.push("date = ?")
            }
            if (time) {
                values.push(time)
                fields.push("time = ?")
            }
            if (status) {
                values.push(status)
                fields.push("status = ?")
            }

            const sql = "UPDATE appointments SET " + fields.join(", ") + " WHERE appointment_id = ?";

            db.run(sql, [...values, appointment.appointmentId], (err: Error | null) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    public async delete(appointmentId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            db.run("DELETE FROM appointments WHERE appointment_id = ?", [appointmentId], (err: Error | null) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }
}

export default new appointmentRepository();
