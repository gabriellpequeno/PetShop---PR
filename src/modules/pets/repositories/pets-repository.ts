import { db } from "@/database/db";
import type { Pet } from "../models/pet";

export class PetsRepository {
    async findById(id: string): Promise<Pet | undefined> {
        const pet = await db.get<Pet>("SELECT * FROM pets WHERE id = ?", [id]);
        return pet;
    }

    async findByUserId(userId: string): Promise<Pet[]> {
        const pets = await db.all<Pet[]>("SELECT * FROM pets WHERE userId = ?", [userId]);
        return pets;
    }
}
