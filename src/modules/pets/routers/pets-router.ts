import { Router } from 'express'
import { CreatePetController } from '../controllers/create-pet-controller'
import { ListPetsController } from '../controllers/list-pets-controller'
import { EnsureAuthenticationMiddleware } from '@/middlewares/ensure-authentication-middleware'

const petsRouter = Router()

petsRouter.use(EnsureAuthenticationMiddleware.handle)

petsRouter.post('/api/pets', CreatePetController.handle)
petsRouter.get('/api/pets', ListPetsController.handle)

export { petsRouter }
