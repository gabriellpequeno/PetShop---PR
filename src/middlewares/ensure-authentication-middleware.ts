import type { Request, Response, NextFunction } from 'express'
import { JwtProvider } from '@/modules/auth/providers/jwt-provider'

export class EnsureAuthenticationMiddleware {
  static handle(request: Request, response: Response, next: NextFunction) {
    const authHeader = request.headers.authorization
    let token: string | undefined

    if (authHeader) {
      [, token] = authHeader.split(' ')
    }

    if (!token && request.cookies) {
      token = request.cookies.token
    }

    if (!token) {
      return response.redirect('/login')
    }


    const jwtProvider = new JwtProvider()
    const payload = jwtProvider.validateToken(token)

    if (!payload) {
      return response.redirect('/login')
    }

    request.user = {
      id: payload.sub,
      role: payload.role
    }

    return next()
  }
}
