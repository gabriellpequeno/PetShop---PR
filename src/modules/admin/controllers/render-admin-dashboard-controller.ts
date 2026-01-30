import type { Request, Response } from 'express'
import { join } from 'node:path'
import { UI_STATIC_PATH } from '@/constants/ui-static-path'


import { HtmlRenderer } from '@/utils/html-renderer'

export class RenderAdminDashboardController {
    static handle(_request: Request, response: Response) {
        return HtmlRenderer.render(response, 'admin-dashboard.html')
    }
}
