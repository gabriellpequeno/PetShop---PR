import type { NextFunction, Request, Response } from 'express'
import { UpdateProfileService } from '../services/update-profile-service'
import { UsersRepository } from '../repositories/users-repository'

export class UsersController {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      // Assuming userId is attached to req.user (by auth middleware)
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const usersRepository = new UsersRepository()
      const updateProfileService = new UpdateProfileService(usersRepository)

      const user = await updateProfileService.getProfile(userId)

      return res.json(user)
    } catch (error) {
      next(error)
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id
      const { name, phone, location, birth_date } = req.body

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const usersRepository = new UsersRepository()
      const updateProfileService = new UpdateProfileService(usersRepository)

      await updateProfileService.execute({
        userId,
        name,
        phone,
        location,
        birth_date,
      })

      return res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
}
