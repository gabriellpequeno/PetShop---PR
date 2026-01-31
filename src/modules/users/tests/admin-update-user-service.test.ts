import { describe, expect, it, beforeEach } from 'vitest'
import { mock, type MockProxy } from 'vitest-mock-extended'
import { AdminUpdateUserService } from '../services/admin-update-user-service'
import type { UsersRepository } from '../repositories/users-repository'
import { BadRequestError } from '@/errors/bad-request-error'
import { NotFoundError } from '@/errors/not-found-error'
import { UnauthorizedError } from '@/errors/unauthorized-error'

describe('AdminUpdateUserService', () => {
    let repository: MockProxy<UsersRepository>
    let service: AdminUpdateUserService

    const mockUser = {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password',
        role: 'customer' as const,
        phone: '(11) 91234-5678',
        location: 'São Paulo',
        birth_date: '1990-01-15',
    }

    beforeEach(() => {
        repository = mock<UsersRepository>()
        service = new AdminUpdateUserService(repository)
        repository.findById.mockResolvedValue(mockUser)
        repository.findByEmail.mockResolvedValue(null as any)
    })

    // Bug 1: Email deve atualizar corretamente
    describe('Email Update', () => {
        it('should update email when provided', async () => {
            await service.execute({
                role: 'admin',
                userId: 'user-1',
                email: 'newemail@example.com',
            })

            expect(repository.update).toHaveBeenCalledWith('user-1', {
                email: 'newemail@example.com',
            })
        })

        it('should throw BadRequestError if email is already in use', async () => {
            repository.findByEmail.mockResolvedValue({ ...mockUser, id: 'other-user' })

            await expect(
                service.execute({
                    role: 'admin',
                    userId: 'user-1',
                    email: 'existing@example.com',
                })
            ).rejects.toThrow(BadRequestError)
        })
    })

    // Bug 2: Validação de telefone brasileiro
    describe('Phone Validation', () => {
        it('should accept valid phone format: (XX) 9XXXX-XXXX', async () => {
            await expect(
                service.execute({
                    role: 'admin',
                    userId: 'user-1',
                    phone: '(11) 98765-4321',
                })
            ).resolves.not.toThrow()
        })

        it('should accept valid phone format: (XX) XXXX-XXXX', async () => {
            await expect(
                service.execute({
                    role: 'admin',
                    userId: 'user-1',
                    phone: '(11) 8765-4321',
                })
            ).resolves.not.toThrow()
        })

        it('should throw BadRequestError for invalid phone format', async () => {
            await expect(
                service.execute({
                    role: 'admin',
                    userId: 'user-1',
                    phone: '123456789', // 9 digits - invalid
                })
            ).rejects.toThrow(BadRequestError)
        })

        it('should throw BadRequestError with clear message for invalid phone', async () => {
            await expect(
                service.execute({
                    role: 'admin',
                    userId: 'user-1',
                    phone: 'invalid',
                })
            ).rejects.toThrow('Formato de telefone incorreto')
        })
    })

    // Bug 3: Validação de data de nascimento
    describe('Birth Date Validation', () => {
        it('should accept valid birth date in the past', async () => {
            await expect(
                service.execute({
                    role: 'admin',
                    userId: 'user-1',
                    birth_date: '1990-05-20',
                })
            ).resolves.not.toThrow()
        })

        it('should throw BadRequestError for future birth date', async () => {
            const futureDate = new Date()
            futureDate.setFullYear(futureDate.getFullYear() + 1)
            const futureDateString = futureDate.toISOString().split('T')[0]!

            await expect(
                service.execute({
                    role: 'admin',
                    userId: 'user-1',
                    birth_date: futureDateString,
                })
            ).rejects.toThrow(BadRequestError)
        })

        it('should throw BadRequestError with clear message for invalid birth date', async () => {
            await expect(
                service.execute({
                    role: 'admin',
                    userId: 'user-1',
                    birth_date: '2030-01-01',
                })
            ).rejects.toThrow('Data de nascimento inválida')
        })
    })

    // Testes de autorização existentes
    describe('Authorization', () => {
        it('should throw UnauthorizedError if role is not admin', async () => {
            await expect(
                service.execute({
                    role: 'customer',
                    userId: 'user-1',
                    name: 'New Name',
                })
            ).rejects.toThrow(UnauthorizedError)
        })

        it('should throw NotFoundError if user does not exist', async () => {
            repository.findById.mockResolvedValue(undefined)

            await expect(
                service.execute({
                    role: 'admin',
                    userId: 'non-existent',
                    name: 'New Name',
                })
            ).rejects.toThrow(NotFoundError)
        })
    })
})
