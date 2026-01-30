import type { Request, Response } from 'express'
import { join } from 'node:path'
import { UI_STATIC_PATH } from '@/constants/ui-static-path'

export class RenderBookingPageController {
  static handle(_req: Request, res: Response) {
    return res.sendFile(join(UI_STATIC_PATH, 'pages', 'booking.html'))
  }
}
