import { join } from 'node:path'
import { build } from 'esbuild'
import type { NextFunction, Request, Response } from 'express'

import { UI_SCRIPTS_PATH } from '../constants/ui-scripts-path'
import { InternalServerError } from '@/errors/internal-server-error'

export class TranspileScriptMiddleware {
  static async handle(request: Request, response: Response, next: NextFunction) {
    try {
      const scriptName = request.params[0]
      const tsFilePath = join(UI_SCRIPTS_PATH, `${scriptName}.ts`)

      const result = await build({
        entryPoints: [tsFilePath],
        bundle: true,
        write: false,
        platform: 'browser',
        format: 'esm',
        target: 'es2020',
        tsconfig: join(process.cwd(), 'tsconfig.json'),
      })

      if (!result.outputFiles || result.outputFiles.length === 0) {
        throw new InternalServerError('No output files generated')
      }

      const file = result.outputFiles[0]
      if (!file) {
        throw new InternalServerError('No output file generated')
      }
      const code = file.text

      response.type('application/javascript')
      response.send(code)
    } catch (error) {
      console.error(`Erro ao compilar script ${request.path}:`, error)
      next()
    }
  }
}
