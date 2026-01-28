import type { Request, Response } from 'express'
import { join } from 'path'

import { UI_STATIC_PATH } from '@/constants/ui-static-path'

export class RenderPetsPageController {
  static async handle(_: Request, response: Response) {
    return response.sendFile(join(UI_STATIC_PATH, 'pages', 'pets.html'))
  }
}
