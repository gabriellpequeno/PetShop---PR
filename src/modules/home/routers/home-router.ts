import { Router } from 'express'
import { RenderHomePageController } from '../controllers/render-home-page-controller'

const homeRouter = Router()

homeRouter.get('/', RenderHomePageController.handle)

export { homeRouter }
