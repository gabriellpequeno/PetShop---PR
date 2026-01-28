import { Router } from 'express'
import { LoginUserController } from '../controllers/login-user-controller'
import { RegisterUserController } from '../controllers/register-user-controller'
import { LogoutUserController } from '../controllers/logout-user-controller'

const authRouter = Router()

authRouter.post('/api/auth/login', LoginUserController.handle)
authRouter.post('/api/auth/register', RegisterUserController.handle)
authRouter.post('/api/auth/logout', LogoutUserController.handle)

export { authRouter }
