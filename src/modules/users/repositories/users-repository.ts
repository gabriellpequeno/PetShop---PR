import { db } from '@/database/db'
import type { User } from '@/modules/users/models/user'
import { v4 as uuid } from 'uuid'


export class UsersRepository {
  async add(user: Omit<User, 'id'>) {
    await db.run(
      'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [uuid(), user.name, user.email, user.password, user.role]
    )
  }

  async findByEmail(email: string) {
    const user = await db.get<User>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )
    return user
  }
}