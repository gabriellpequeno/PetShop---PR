import { Router } from 'express'
import { EnsureAuthenticationMiddleware } from '@/middlewares/ensure-authentication-middleware'
import { ListAllUsersController } from '../controllers/list-all-users-controller'
import { SearchUsersByEmailController } from '../controllers/search-users-by-email-controller'
import { GetUserByIdController } from '../controllers/get-user-by-id-controller'
import { AdminUpdateUserController } from '../controllers/admin-update-user-controller'
import { DeleteUserController } from '../controllers/delete-user-controller'
import { GetUserPetsController } from '../controllers/get-user-pets-controller'

export const adminUsersRouter = Router()

// All admin routes are protected by authentication
adminUsersRouter.use(EnsureAuthenticationMiddleware.handle)

// Admin user management routes
adminUsersRouter.get('/api/admin/users', ListAllUsersController.handle)
adminUsersRouter.get('/api/admin/users/search', SearchUsersByEmailController.handle)
adminUsersRouter.get('/api/admin/users/:id', GetUserByIdController.handle)
adminUsersRouter.put('/api/admin/users/:id', AdminUpdateUserController.handle)
adminUsersRouter.delete('/api/admin/users/:id', DeleteUserController.handle)
adminUsersRouter.get('/api/admin/users/:id/pets', GetUserPetsController.handle)
