import { describe, expect, it, vi } from 'vitest'
import { UpdateProfileService } from '../services/update-profile-service'
import { UsersRepository } from '../repositories/users-repository'
import { AppError } from '@/errors/app-error'

const usersRepositorySpy = {
  add: vi.fn(),
  findByEmail: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
} as unknown as UsersRepository

const sut = new UpdateProfileService(usersRepositorySpy)

describe('Update Profile Service', () => {
  it('should be able to update user profile', async () => {
    vi.spyOn(usersRepositorySpy, 'findById').mockResolvedValue({
      id: 'any_id',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password',
      role: 'customer',
    })

    await expect(
      sut.execute({
        userId: 'any_id',
        name: 'John Trevor',
        phone: '123456789',
        location: 'New York',
        birth_date: '1990-01-01',
      })
    ).resolves.not.toThrow()

    expect(usersRepositorySpy.update).toHaveBeenCalledWith('any_id', {
      name: 'John Trevor',
      phone: '123456789',
      location: 'New York',
      birth_date: '1990-01-01',
    })
  })

  it('should not be able to update non-existing user', async () => {
    vi.spyOn(usersRepositorySpy, 'findById').mockResolvedValue(undefined)

    await expect(
      sut.execute({
        userId: 'invalid_id',
        name: 'John Trevor',
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should be able to get user profile', async () => {
    vi.spyOn(usersRepositorySpy, 'findById').mockResolvedValue({
      id: 'any_id',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password',
      role: 'customer',
      phone: '123456789',
    })

    const profile = await sut.getProfile('any_id')

    expect(profile).toEqual({
      id: 'any_id',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'customer',
      phone: '123456789',
    })
    expect(profile).not.toHaveProperty('password')
  })
})
