import type { Request, Response } from 'express'

export class LogoutUserController {
  static async handle(request: Request, response: Response) {
    response.clearCookie('token', {
      httpOnly: true,
      path: '/'
    })

    return response.status(204).send()
  }
}
