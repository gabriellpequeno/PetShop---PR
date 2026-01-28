import { AppError } from '@/errors/app-error'
import { DeletePetService } from '../services/delete-pet-service'
import { PetsFaker } from '../fakers/pets-faker'
import { PetsRepository } from '../repositories/pets-repository'
import { describe, expect, it, vi } from 'vitest'
import { mock } from 'vitest-mock-extended'

describe('DeletePetService', () => {
  const repository = mock<PetsRepository>()
  const service = new DeletePetService(repository)

  it('should delete a pet if owner', async () => {
    const pet = PetsFaker.fake({ user_id: 'user-id' })
    repository.findById.mockResolvedValue(pet)

    await expect(service.execute({
      id: pet.id,
      userId: 'user-id',
      role: 'customer'
    })).resolves.not.toThrow()

    expect(repository.delete).toHaveBeenCalledWith(pet.id)
  })

  it('should delete a pet if admin', async () => {
    const pet = PetsFaker.fake({ user_id: 'other-user-id' })
    repository.findById.mockResolvedValue(pet)

    await expect(service.execute({
      id: pet.id,
      userId: 'admin-id',
      role: 'admin'
    })).resolves.not.toThrow()

    expect(repository.delete).toHaveBeenCalledWith(pet.id)
  })

  it('should throw AppError if pet not found', async () => {
    repository.findById.mockResolvedValue(undefined)

    await expect(service.execute({
      id: 'invalid-id',
      userId: 'user-id',
      role: 'customer'
    })).rejects.toThrow(AppError)
  })

  it('should throw AppError if user is not owner and not admin', async () => {
    const pet = PetsFaker.fake({ user_id: 'other-user-id' })
    repository.findById.mockResolvedValue(pet)

    await expect(service.execute({
      id: pet.id,
      userId: 'user-id',
      role: 'customer'
    })).rejects.toThrow(AppError)
  })
})
