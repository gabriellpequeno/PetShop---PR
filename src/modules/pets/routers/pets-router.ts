import { Router } from 'express'
import { CreatePetController } from '../controllers/create-pet-controller'
import { DeletePetController } from '../controllers/delete-pet-controller'
import { EnsureAuthenticationMiddleware } from '@/middlewares/ensure-authentication-middleware'
import { ListPetsController } from '../controllers/list-pets-controller'
import { UpdatePetController } from '../controllers/update-pet-controller'

const petsRouter = Router()

petsRouter.post('/api/pets', EnsureAuthenticationMiddleware.handle, CreatePetController.handle)
petsRouter.get('/api/pets', EnsureAuthenticationMiddleware.handle, ListPetsController.handle)
petsRouter.put('/api/pets/:id', EnsureAuthenticationMiddleware.handle, UpdatePetController.handle)
petsRouter.delete('/api/pets/:id', EnsureAuthenticationMiddleware.handle, DeletePetController.handle)

export { petsRouter }
