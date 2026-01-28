import express from 'express'
import cookieParser from 'cookie-parser'
import { join } from 'node:path'
import { TranspileScriptMiddleware } from './middlewares/transpile-script-middleware'
import { HandleErrorMiddleware } from './middlewares/handle-error-middleware'
import { UI_STATIC_PATH } from './constants/ui-static-path'
import { authRouter } from './modules/auth/routers/auth-router'
import { petsRouter } from './modules/pets/routers/pets-router'
import { usersRouter } from './modules/users/routers/users-router'
import { EnsureAuthenticationMiddleware } from './middlewares/ensure-authentication-middleware'
import { homeRouter } from './modules/home/routers/home-router'
import { petsPageRouter } from './modules/pets/routers/pets-page-router'
import { usersPageRouter } from './modules/users/routers/users-page-router'

const app = express()

app.use(express.json())
app.use(cookieParser())


app.use(express.static(UI_STATIC_PATH))

app.get(/^\/scripts\/(.+)\.js$/, TranspileScriptMiddleware.handle)

app.use(authRouter)
app.use(homeRouter)
app.use(petsPageRouter)
app.use(usersPageRouter)

app.use('/api/pets', petsRouter)
app.use('/api/users', usersRouter)

app.use(HandleErrorMiddleware.handle)

export { app }
