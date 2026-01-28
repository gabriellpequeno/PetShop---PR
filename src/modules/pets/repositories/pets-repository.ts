import { db } from '@/database/db'
import { v4 as uuid } from 'uuid'
import type { Pet } from '../models/pet'

export class PetsRepository {
  async add(pet: Omit<Pet, 'id'>) {
    await db.run(
      'INSERT INTO pets (id, user_id, name, species, breed, birth_date, weight) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [uuid(), pet.user_id, pet.name, pet.species, pet.breed, pet.birth_date, pet.weight]
    )
  }

  async findByUserId(userId: string) {
    const pets = await db.all<Pet[]>(
      'SELECT * FROM pets WHERE user_id = ?',
      [userId]
    )
    return pets
  }

  async findAll() {
    const pets = await db.all<Pet[]>('SELECT * FROM pets')
    return pets
  }
}
