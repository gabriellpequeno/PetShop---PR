

import type { Response } from 'express'
import { join } from 'path'
import { readFile } from 'fs/promises'
import { UI_STATIC_PATH } from '@/constants/ui-static-path'

export class HtmlRenderer {
    static async render(response: Response, pagePath: string) {
        try {
            const fullPath = join(UI_STATIC_PATH, 'pages', pagePath)
            let content = await readFile(fullPath, 'utf-8')

            // Determine Base URL from environment or default to '/'
            // Ensure it ends with a slash
            let baseUrl = process.env.APP_BASE_URL ?? '/'
            if (!baseUrl.endsWith('/')) {
                baseUrl += '/'
            }

            // Inject <base> tag after <head>
            const baseTag = `<base href="${baseUrl}" />`
            content = content.replace('<head>', `<head>\n  ${baseTag}`)

            // Also inject a global JS variable for client-side scripts to use
            const configScript = `
  <script>
    window.APP_BASE_URL = "${baseUrl}";
  </script>`
            content = content.replace('</head>', `${configScript}\n</head>`)

            response.setHeader('Content-Type', 'text/html')
            response.send(content)
        } catch (error) {
            console.error(`Error rendering page ${pagePath}:`, error)
            response.status(500).send('Internal Server Error')
        }

    }

    static redirect(response: Response, path: string) {
        let baseUrl = process.env.APP_BASE_URL ?? '/'
        if (!baseUrl.endsWith('/')) {
            baseUrl += '/'
        }

        // Remove leading slash from path to append cleanly
        const cleanPath = path.startsWith('/') ? path.slice(1) : path
        const fullUrl = `${baseUrl}${cleanPath}`

        return response.redirect(fullUrl)
    }
}
