import { db } from "@/database/db";
import { v4 as uuid } from "uuid";
import type { Pet } from "../models/pet";

export class PetsRepository {
  async add(pet: Omit<Pet, "id">) {
    await db.run(
      "INSERT INTO pets (id, userId, name, species, breed, age, weight, size) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        uuid(),
        pet.userId,
        pet.name,
        pet.species,
        pet.breed,
        pet.age,
        pet.weight,
        pet.size,
      ],
    );
  }

  async findByUserId(userId: string) {
    const pets = await db.all<Pet[]>("SELECT * FROM pets WHERE userId = ?", [
      userId,
    ]);
    return pets;
  }

  async findAll() {
    const pets = await db.all<Pet[]>("SELECT * FROM pets");
    return pets;
  }

  async findById(id: string) {
    const pet = await db.get<Pet>("SELECT * FROM pets WHERE id = ?", [id]);
    return pet;
  }

  async update(pet: Pet) {
    await db.run(
      "UPDATE pets SET name = ?, species = ?, breed = ?, age = ?, weight = ?, size = ? WHERE id = ?",
      [pet.name, pet.species, pet.breed, pet.age, pet.weight, pet.size, pet.id],
    );
  }

  async delete(id: string) {
    await db.run("DELETE FROM pets WHERE id = ?", [id]);
  }

  async deleteByUserId(userId: string) {
    await db.run("DELETE FROM pets WHERE userId = ?", [userId]);
  }
}
