import type { Request, Response } from 'express'
import path from 'path'
import { UI_STATIC_PATH } from '@/constants/ui-static-path'
import { UnauthorizedError } from '@/errors/unauthorized-error'


import { HtmlRenderer } from '@/utils/html-renderer'

export class RenderAdminUsersPageController {
  static async handle(request: Request, response: Response) {
    const role = request.user?.role

    if (role !== 'admin') {
      throw new UnauthorizedError('Apenas administradores podem acessar esta página')
    }

    return HtmlRenderer.render(response, 'admin-users.html')
  }
}
