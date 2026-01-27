import { Router } from 'express'
import { RenderLoginPageController } from '../controllers/render-login-page-controller'
import { RenderRegisterPageController } from '../controllers/render-register-page-controller'
import { LoginUserController } from '../controllers/login-user-controller'
import { RegisterUserController } from '../controllers/register-user-controller'

const authRouter = Router()

authRouter.get('/login', RenderLoginPageController.handle)
authRouter.get('/register', RenderRegisterPageController.handle)

authRouter.post('/api/auth/login', LoginUserController.handle)
authRouter.post('/api/auth/register', RegisterUserController.handle)

export { authRouter }
