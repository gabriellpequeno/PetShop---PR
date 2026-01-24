import { Request, Response } from "express";
import serviceRepository from "../repositories/serviceRepositories.js";

class ServiceController {
    public async findAll(req: Request, res: Response): Promise<Response> {
        try {
            const services = await serviceRepository.findAll();
            return res.status(200).json(services);
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Erro ao buscar serviços.";
            return res.status(500).json({ error: errorMessage });
        }
    }

    public async save(req: Request, res: Response): Promise<Response> {
        try {
            const serviceData = req.body;

            await serviceRepository.save(serviceData);

            return res.status(201).json({ message: "Serviço cadastrado com sucesso!" });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Erro ao cadastrar serviço.";
            return res.status(400).json({ error: errorMessage });
        }
    }

    public async update(req: Request, res: Response): Promise<Response> {

        if (!serviceRepository.findByServiceName(req.body.nameService)) {
            return res.status(404).json({ message: "Serviço não encontrado." });
        }

        try {
            const serviceData = req.body;

            await serviceRepository.update(serviceData);

            return res.status(201).json({ message: "Serviço atualizado com sucesso!" });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Erro ao atualizar serviço.";
            return res.status(400).json({ error: errorMessage });
        }
    }

    public async delete(req: Request, res: Response): Promise<Response> {
        try {
            const serviceId = req.body.serviceId;

            await serviceRepository.delete(serviceId);

            return res.status(201).json({ message: "Serviço deletado com sucesso!" });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Erro ao deletar serviço.";
            return res.status(400).json({ error: errorMessage });
        }
    }
}

export default new ServiceController();