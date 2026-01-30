import { db } from '@/database/db'
import type { User } from '@/modules/users/models/user'
import { v4 as uuid } from 'uuid'


export class UsersRepository {
  async add(user: Omit<User, 'id'>) {
    await db.run(
      'INSERT INTO users (id, name, email, password, role, phone, location, birth_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [uuid(), user.name, user.email, user.password, user.role, user.phone ?? null, user.location ?? null, user.birth_date ?? null]
    )
  }

  async findByEmail(email: string) {
    const user = await db.get<User>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )
    return user
  }

  async findById(id: string) {
    const user = await db.get<User>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    )
    return user
  }

  async update(id: string, data: Partial<User>) {
    await db.run(
      `UPDATE users SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        location = COALESCE(?, location),
        birth_date = COALESCE(?, birth_date)
      WHERE id = ?`,
      [data.name, data.email, data.phone ?? null, data.location ?? null, data.birth_date ?? null, id]
    )
  }

  async findAll() {
    const users = await db.all<User[]>('SELECT * FROM users')
    return users
  }

  async searchByEmail(email: string) {
    const users = await db.all<User[]>(
      'SELECT * FROM users WHERE email LIKE ?',
      [`%${email}%`]
    )
    return users
  }

  async delete(id: string) {
    await db.run('DELETE FROM users WHERE id = ?', [id])
  }
}