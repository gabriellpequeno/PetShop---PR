import type { Request, Response } from 'express'
import { join } from 'node:path'
import { UI_STATIC_PATH } from '@/constants/ui-static-path'

export class RenderAdminDashboardController {
    static handle(_request: Request, response: Response) {
        return response.sendFile(join(UI_STATIC_PATH, 'pages', 'admin-dashboard.html'))
    }
}
