import { Router } from 'express'
import { RenderPetsPageController } from '../controllers/render-pets-page-controller'

import { EnsureAuthenticationMiddleware } from '@/middlewares/ensure-authentication-middleware'

const petsPageRouter = Router()

petsPageRouter.get('/pets', EnsureAuthenticationMiddleware.handle, RenderPetsPageController.handle)

export { petsPageRouter }
