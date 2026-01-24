import serviceRepository from "../repositories/serviceRepositories.js";
import { validateService } from "../utils/validators.js";
import { Service } from "../types/Services.js";

class ServiceService {
    public async findAll(): Promise<Service[]> {
        return serviceRepository.findAll();
    }

    public async save(service: Service): Promise<void> {
        if (!validateService(service)) {
            throw new Error("Dados inválidos");
        }
        await serviceRepository.save(service);
    }

    public async update(service: Service): Promise<void> {
        if (!validateService(service)) {
            throw new Error("Dados inválidos");
        }
        await serviceRepository.update(service);
    }

    public async delete(serviceId: string): Promise<void> {
        await serviceRepository.delete(serviceId);
    }
}