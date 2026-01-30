import { Router } from 'express'
import { EnsureAuthenticationMiddleware } from '@/middlewares/ensure-authentication-middleware'
import { EnsureAdminMiddleware } from '@/middlewares/ensure-admin-middleware'
import { RenderAdminDashboardController } from '../controllers/render-admin-dashboard-controller'
import { RenderAdminPetsController } from '../controllers/render-admin-pets-controller'
import { RenderAdminBookingsController } from '../controllers/render-admin-bookings-controller'
import { DashboardSummaryController } from '../controllers/dashboard-summary-controller'
import { UsersSummaryController } from '../controllers/users-summary-controller'
import { UsersListController } from '../controllers/users-list-controller'
import { PetsListController } from '../controllers/pets-list-controller'
import { BookingsListController } from '../controllers/bookings-list-controller'
import { AdminPetsController } from '../controllers/admin-pets-controller'

const adminRouter = Router()

// Todas as rotas admin requerem autenticação e role admin
adminRouter.use(EnsureAuthenticationMiddleware.handle)
adminRouter.use(EnsureAdminMiddleware.handle)

// Páginas do Admin
adminRouter.get('/admin/dashboard', RenderAdminDashboardController.handle)
adminRouter.get('/admin/pets', RenderAdminPetsController.handle)
adminRouter.get('/admin/bookings', RenderAdminBookingsController.handle)

// API endpoints - Dashboard
adminRouter.get('/api/admin/dashboard-summary', DashboardSummaryController.handle)
adminRouter.get('/api/admin/users-summary', UsersSummaryController.handle)
adminRouter.get('/api/admin/users-list', UsersListController.handle)
adminRouter.get('/api/admin/pets-list', PetsListController.handle)
adminRouter.get('/api/admin/bookings-list', BookingsListController.handle)

// API endpoints - Admin Pets Management
adminRouter.get('/api/admin/pets', AdminPetsController.list)
adminRouter.get('/api/admin/pets/users', AdminPetsController.getUsers)
adminRouter.put('/api/admin/pets/:id', AdminPetsController.update)
adminRouter.delete('/api/admin/pets/:id', AdminPetsController.delete)

export { adminRouter }
