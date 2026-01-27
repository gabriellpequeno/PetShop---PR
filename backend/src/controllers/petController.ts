import { Request, Response } from "express";
import { IPetCreate, IPetUpdate } from "../types/Pets.js";
import { petService } from "../services/petService.js";

export const petController = {
    create: async (req: Request, res: Response) => {
        try {
            const petData = req.body as IPetCreate;
            const petId = await petService.create(petData);
            return res.status(201).json({ id: petId, message: "Pet cadastrado com sucesso!" });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao cadastrar pet.", error });
        }
    },

    listByUser: async (req: Request, res: Response) => {
        try {

            const userId = parseInt(req.params.userId as string);

            if (isNaN(userId)) {
                return res.status(400).json({ message: "ID de usuário inválido." });
            }

            const pets = await petService.listByUser(userId);

            return res.status(200).json(pets);

        } catch (error) {
            // Caso aconteça algum erro inesperado
            return res.status(500).json({ message: "Erro ao buscar pets.", error });
        }
    },

    update: async (req: Request, res: Response) => {
        try {
            const petId = parseInt(req.params.petId as string);

            if (isNaN(petId)) {
                return res.status(400).json({ message: "ID de pet inválido." });
            }

            const petData: IPetUpdate = {
                id: petId,
                ...req.body
            };

            await petService.update(petData);
            return res.status(200).json({ message: "Pet atualizado com sucesso!" });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao atualizar pet.", error });
        }
    },

    deletePet: async (req: Request, res: Response) => {
        try {
            const petId = parseInt(req.params.petId as string);

            if (isNaN(petId)) {
                return res.status(400).json({ message: "ID de pet inválido." });
            }

            const pet = await petService.deletePet(petId);
            return res.status(200).json({ message: "Pet deletado com sucesso!" });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao deletar pet.", error });
        }
    }

};

