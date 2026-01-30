import type { Request, Response } from 'express'
import { join } from 'path'

import { UI_STATIC_PATH } from '@/constants/ui-static-path'


import { HtmlRenderer } from '@/utils/html-renderer'

export class RenderCustomerDashboardController {
  static async handle(_: Request, response: Response) {
    return HtmlRenderer.render(response, 'customer-dashboard.html')
  }
}
