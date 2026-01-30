import { db } from '@/database/db'

export interface PetWithOwner {
  id: string
  name: string
  species: string
  breed: string | null
  age: number | null
  weight: number | null
  size: 'P' | 'M' | 'G'
  userId: string
  ownerName: string
  ownerEmail: string
}

export interface UserOption {
  id: string
  name: string
  email: string
}

interface FilterOptions {
  search?: string | undefined
  userId?: string | undefined
}

export class AdminPetsRepository {
  async getAllPetsWithOwner(filters?: FilterOptions): Promise<PetWithOwner[]> {
    let query = `
      SELECT 
        p.id,
        p.name,
        p.species,
        p.breed,
        p.age,
        p.weight,
        p.size,
        p.userId,
        u.name as ownerName,
        u.email as ownerEmail
      FROM pets p
      JOIN users u ON p.userId = u.id
      WHERE 1=1
    `
    const params: string[] = []

    if (filters?.search) {
      query += ` AND (p.name LIKE ? OR p.species LIKE ? OR p.breed LIKE ?)`
      const searchTerm = `%${filters.search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    if (filters?.userId) {
      query += ` AND p.userId = ?`
      params.push(filters.userId)
    }

    query += ` ORDER BY p.name ASC`

    const pets = await db.all<PetWithOwner[]>(query, params)
    return pets
  }

  async getAllUsers(): Promise<UserOption[]> {
    const users = await db.all<UserOption[]>(`
      SELECT id, name, email
      FROM users
      WHERE role = 'customer'
      ORDER BY name ASC
    `)
    return users
  }
}
