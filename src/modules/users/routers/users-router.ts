import { Router } from 'express'
import { UsersController } from '../controllers/users-controller'
import { EnsureAuthenticationMiddleware } from '@/middlewares/ensure-authentication-middleware'

export const usersRouter = Router()
const usersController = new UsersController()

// All routes here are protected
usersRouter.use(EnsureAuthenticationMiddleware.handle)

usersRouter.get('/api/users/me', usersController.getProfile)
usersRouter.put('/api/users/me', usersController.updateProfile)
