import { Router } from 'express'
import { EnsureAuthenticationMiddleware } from '@/middlewares/ensure-authentication-middleware'
import { EnsureAdminMiddleware } from '@/middlewares/ensure-admin-middleware'
import { RenderAdminDashboardController } from '../controllers/render-admin-dashboard-controller'
import { DashboardSummaryController } from '../controllers/dashboard-summary-controller'
import { UsersSummaryController } from '../controllers/users-summary-controller'
import { UsersListController } from '../controllers/users-list-controller'
import { PetsListController } from '../controllers/pets-list-controller'
import { BookingsListController } from '../controllers/bookings-list-controller'

const adminRouter = Router()

// Todas as rotas admin requerem autenticação e role admin
adminRouter.use(EnsureAuthenticationMiddleware.handle)
adminRouter.use(EnsureAdminMiddleware.handle)

// Página do Dashboard
adminRouter.get('/admin/dashboard', RenderAdminDashboardController.handle)

// API endpoints
adminRouter.get('/api/admin/dashboard-summary', DashboardSummaryController.handle)
adminRouter.get('/api/admin/users-summary', UsersSummaryController.handle)
adminRouter.get('/api/admin/users-list', UsersListController.handle)
adminRouter.get('/api/admin/pets-list', PetsListController.handle)
adminRouter.get('/api/admin/bookings-list', BookingsListController.handle)

export { adminRouter }
