import db from "../utils/database.js";
import { v4 as uuid } from "uuid";
import { Service } from "../types/Services.js";
import { validateService } from "../utils/validators.js";

class ServiceRepository {

    public async findAll(): Promise<Service[]> {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM services", (err: Error | null, rows: Service[]) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    public async findByServiceId(serviceId: string): Promise<Service | null> {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM services WHERE service_id = ?", [serviceId], (err: Error | null, row: Service | undefined) => {
                if (err) return reject(err);
                resolve(row || null);
            });
        });
    }

    public async findByServiceName(serviceName: string): Promise<Service | null> {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM services WHERE name_service = ?", [serviceName], (err: Error | null, row: Service | undefined) => {
                if (err) return reject(err);
                resolve(row || null);
            });
        });
    }

    public async save(service: Service): Promise<void> {
        return new Promise((resolve, reject) => {
            const newService: Partial<Service> = service;
            if (!newService.nameService || !newService.priceP || !newService.priceM || !newService.priceG) {
                throw new Error("Dados inválidos");
            }
            if (!validateService(service)) {
                throw new Error("Dados inválidos");
            }
            newService.serviceId = uuid();

            const sql = "INSERT INTO services (service_id, name_service, price_p, price_m, price_g) VALUES (?, ?, ?, ?, ?)";

            db.run(sql, [newService.serviceId, newService.nameService, newService.priceP, newService.priceM, newService.priceG], (err: Error | null) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    public async update(service: Service): Promise<void> {
        return new Promise((resolve, reject) => {
            const { nameService, priceP, priceM, priceG } = service;
            if (!nameService || !priceP || !priceM || !priceG) {
                throw new Error("Dados inválidos");
            }
            if (!validateService(service)) {
                throw new Error("Dados inválidos");
            }

            const values = []
            const fields = []
            if (nameService) {
                values.push(nameService)
                fields.push("name_service = ?")
            }
            if (priceP) {
                values.push(priceP)
                fields.push("price_p = ?")
            }
            if (priceM) {
                values.push(priceM)
                fields.push("price_m = ?")
            }
            if (priceG) {
                values.push(priceG)
                fields.push("price_g = ?")
            }

            const sql = "UPDATE services SET " + fields.join(", ") + " WHERE service_id = ?";

            db.run(sql, [...values, service.serviceId], (err: Error | null) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    public async delete(serviceId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM services WHERE service_id = ?";

            db.run(sql, [serviceId], (err: Error | null) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }
}

export default new ServiceRepository();
