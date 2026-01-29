import { Router } from 'express'
import { RenderAdminUsersPageController } from '../controllers/render-admin-users-page-controller'
import { EnsureAuthenticationMiddleware } from '@/middlewares/ensure-authentication-middleware'

export const adminUsersPageRouter = Router()

adminUsersPageRouter.get(
  '/pages/admin/users.html',
  EnsureAuthenticationMiddleware.handle,
  RenderAdminUsersPageController.handle
)
