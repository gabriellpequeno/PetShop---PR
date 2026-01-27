import express from 'express'
import { join } from 'node:path'
import { TranspileScriptMiddleware } from './middlewares/transpile-script-middleware'
import { HandleErrorMiddleware } from './middlewares/handle-error-middleware'
import { UI_STATIC_PATH } from './constants/ui-static-path'
import { authRouter } from './modules/auth/routers/auth-router'

const app = express()

app.use(express.json())

app.use(express.static(UI_STATIC_PATH))

app.get(/^\/scripts\/(.+)\.js$/, TranspileScriptMiddleware.handle)

app.use(authRouter)

app.get('/', (_, res) => {
  res.sendFile(join(UI_STATIC_PATH, 'pages', 'home.html'))
})

app.use(HandleErrorMiddleware.handle)

export { app }
