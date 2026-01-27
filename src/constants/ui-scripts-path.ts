import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const UI_SCRIPTS_PATH = join(__dirname, '..', 'ui', 'scripts')
