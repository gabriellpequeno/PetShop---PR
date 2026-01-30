import type { Request, Response } from 'express'
import { join } from 'node:path'
import { UI_STATIC_PATH } from '@/constants/ui-static-path'


import { HtmlRenderer } from '@/utils/html-renderer'

export class RenderBookingPageController {
  static handle(_req: Request, res: Response) {
    return HtmlRenderer.render(res, 'booking.html')
  }
}
