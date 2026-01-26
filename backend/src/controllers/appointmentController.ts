import { Request, Response } from "express";
import appointmentService from "../services/appointmentService.js";

class appointmentController {
    public async findAll(req: Request, res: Response) {
        try {
            const appointments = await appointmentService.findAll();
            res.status(200).json(appointments);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erro ao buscar agendamentos" });
        }
    }

    public async save(req: Request, res: Response) {
        try {
            const appointment = await appointmentService.save(req.body);
            res.status(201).json(appointment);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erro ao salvar agendamento" });
        }
    }

    public async update(req: Request, res: Response) {
        try {
            const appointment = await appointmentService.update(req.body);
            res.status(201).json(appointment);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erro ao salvar agendamento" });
        }
    }

    public async delete(req: Request, res: Response) {
        try {
            const appointment = await appointmentService.delete(req.body);
            res.status(201).json(appointment);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erro ao salvar agendamento" });
        }
    }
}

export default new appointmentController();
