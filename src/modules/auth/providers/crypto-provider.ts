import bcrypt from 'bcryptjs'

export class CryptoProvider {
  async generateHash(password: string): Promise<string> {
    return bcrypt.hash(password, 8)
  }

  async compare(payload: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(payload, hashed)
  }
}