import { Router } from 'express'
import { RenderCustomerDashboardController } from '../controllers/render-customer-dashboard-controller'
import { EnsureAuthenticationMiddleware } from '@/middlewares/ensure-authentication-middleware'

const customerDashboardRouter = Router()

customerDashboardRouter.get('/dashboard', EnsureAuthenticationMiddleware.handle, RenderCustomerDashboardController.handle)

export { customerDashboardRouter }
