import { Router } from 'express'
import { RenderLoginPageController } from '../controllers/render-login-page-controller'
import { LoginUserController } from '../controllers/login-user-controller'

const authRouter = Router()

authRouter.get('/login', RenderLoginPageController.handle)
authRouter.post('/api/auth/login', LoginUserController.handle)

export { authRouter }
