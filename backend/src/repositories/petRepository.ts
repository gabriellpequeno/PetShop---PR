import db from "../utils/database.js";
import { IPet, IPetCreate, IPetUpdate } from "../types/Pets.js";

export const petRepository = {
    // Função para salvar um novo Pet no banco
    create: (pet: IPetCreate): Promise<number> => {
        return new Promise((resolve, reject) => {
            const { name, species, breed, age, userId } = pet;

            // O comando SQL que explicamos antes
            const query = `
        INSERT INTO pets (name, species, breed, age, userId) 
        VALUES (?, ?, ?, ?, ?)
    `;

            // Executando o comando
            db.run(query, [name, species, breed, age, userId], function (this: any, err: Error | null) {
                if (err) {
                    reject(err); // Se der erro (ex: banco travado), avisa o sistema
                } else {
                    resolve(this.lastID); // Se der certo, devolve o ID gerado para o pet
                }
            });
        });
    },


    // Função para deletar um pet
    delete: (petId: number): Promise<void> => {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM pets WHERE id = ?`;

            db.run(query, [petId], (err: Error | null) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    },

    // Função para buscar todos os pets de um usuário específico
    findByUserId: (userId: number): Promise<IPet[]> => {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM pets WHERE userId = ?`;

            db.all(query, [userId], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows as IPet[]);
                }
            });
        });
    },

    // Função para atualizar um pet
    update: (petData: IPetUpdate): Promise<void> => {
        return new Promise((resolve, reject) => {
            const { id, name, species, breed, age } = petData;

            // Construir query dinamicamente apenas com campos fornecidos
            const fields: string[] = [];
            const values: any[] = [];

            if (name !== undefined) {
                fields.push("name = ?");
                values.push(name);
            }
            if (species !== undefined) {
                fields.push("species = ?");
                values.push(species);
            }
            if (breed !== undefined) {
                fields.push("breed = ?");
                values.push(breed);
            }
            if (age !== undefined) {
                fields.push("age = ?");
                values.push(age);
            }

            if (fields.length === 0) {
                reject(new Error("Nenhum campo para atualizar"));
                return;
            }

            values.push(id);
            const query = `UPDATE pets SET ${fields.join(", ")} WHERE id = ?`;

            db.run(query, values, function (err: Error | null) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    },

    // Função para deletar um pet pelo ID
    deletePet: (petId: number): Promise<void> => {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM pets WHERE id = ?`;

            db.run(query, [petId], function (err: Error | null) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
};