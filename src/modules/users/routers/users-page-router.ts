import { Router } from 'express'
import { RenderProfilePageController } from '../controllers/render-profile-page-controller'
import { EnsureAuthenticationMiddleware } from '@/middlewares/ensure-authentication-middleware'

const usersPageRouter = Router()

usersPageRouter.get('/profile', EnsureAuthenticationMiddleware.handle, RenderProfilePageController.handle)

export { usersPageRouter }
