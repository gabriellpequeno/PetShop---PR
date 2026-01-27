import jwt from 'jsonwebtoken'

export class JwtProvider {
  private readonly secret = process.env.JWT_SECRET || 'secret'

  generateToken(payload: object): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: '1d'
    })
  }

  validateToken(token: string): any {
    try {
      return jwt.verify(token, this.secret)
    } catch {
      return null
    }
  }
}

