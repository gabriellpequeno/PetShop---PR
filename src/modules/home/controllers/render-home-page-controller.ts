import type { Request, Response } from 'express'
import { join } from 'path'

import { UI_STATIC_PATH } from '@/constants/ui-static-path'
import { JwtProvider } from '@/modules/auth/providers/jwt-provider'

export class RenderHomePageController {
  static async handle(request: Request, response: Response) {
    const authHeader = request.headers.authorization
    let token: string | undefined

    if (authHeader) {
      const parts = authHeader.split(' ')
      if (parts.length === 2) token = parts[1]
    }

    if (!token && request.cookies) {
      token = request.cookies.token
    }

    if (token) {
      const jwtProvider = new JwtProvider()
      const payload = jwtProvider.validateToken(token)
      if (payload) {
        return response.redirect('/profile')
      }
    }

    return response.sendFile(join(UI_STATIC_PATH, 'pages', 'home.html'))
  }
}
