import { AppError } from '@/errors/app-error'
import { PetsFaker } from '../fakers/pets-faker'
import { PetsRepository } from '../repositories/pets-repository'
import { UpdatePetService } from '../services/update-pet-service'
import { describe, expect, it, vi } from 'vitest'
import { mock } from 'vitest-mock-extended'

describe('UpdatePetService', () => {
  const repository = mock<PetsRepository>()
  const service = new UpdatePetService(repository)

  it('should update a pet if owner', async () => {
    const pet = PetsFaker.fake({ user_id: 'user-id' })
    repository.findById.mockResolvedValue(pet)

    await expect(service.execute({
      id: pet.id,
      userId: 'user-id',
      role: 'customer',
      name: 'Updated Name',
      species: 'Dog',
      breed: 'Poodle',
      age: 5,
      weight: 10
    })).resolves.not.toThrow()

    expect(repository.update).toHaveBeenCalledWith(expect.objectContaining({
      id: pet.id,
      name: 'Updated Name'
    }))
  })

  it('should update a pet if admin', async () => {
    const pet = PetsFaker.fake({ user_id: 'other-user-id' })
    repository.findById.mockResolvedValue(pet)

    await expect(service.execute({
      id: pet.id,
      userId: 'admin-id',
      role: 'admin',
      name: 'Updated Name Admin',
      species: 'Dog',
      breed: 'Poodle',
      age: 5,
      weight: 10
    })).resolves.not.toThrow()

    expect(repository.update).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Updated Name Admin'
    }))
  })

  it('should throw AppError if pet not found', async () => {
    repository.findById.mockResolvedValue(undefined)

    await expect(service.execute({
      id: 'invalid-id',
      userId: 'user-id',
      role: 'customer',
      name: 'Updated Name',
      species: 'Dog',
      breed: 'Poodle',
      age: 5,
      weight: 10
    })).rejects.toThrow(AppError)
  })

  it('should throw AppError if user is not owner and not admin', async () => {
    const pet = PetsFaker.fake({ user_id: 'other-user-id' })
    repository.findById.mockResolvedValue(pet)

    await expect(service.execute({
      id: pet.id,
      userId: 'user-id',
      role: 'customer',
      name: 'Updated Name',
      species: 'Dog',
      breed: 'Poodle',
      age: 5,
      weight: 10
    })).rejects.toThrow(AppError)
  })
})
