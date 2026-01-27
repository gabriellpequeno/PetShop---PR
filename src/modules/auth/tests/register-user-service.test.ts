import { mock, type MockProxy } from "vitest-mock-extended";
import { RegisterUserService } from "../services/register-user-service";
import { UsersRepository } from "@/modules/users/repositories/users-repository";
import { ConflictError } from "@/errors/conflict-error";
import type { CryptoProvider } from "../providers/crypto-provider";

describe('Register User Service', () => {
  let repository: MockProxy<UsersRepository>
  let cryptoProvider: MockProxy<CryptoProvider>
  let service: RegisterUserService

  beforeEach(() => {
    repository = mock<UsersRepository>()
    cryptoProvider = mock<CryptoProvider>()
    service = new RegisterUserService(repository, cryptoProvider)
  })

  it('should register successfully if email is not taken', async () => {
    repository.findByEmail.mockResolvedValue(null as any) // sqlite returns null/undefined if not found
    cryptoProvider.generateHash.mockResolvedValue('hashed_password')

    await expect(service.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    })).resolves.not.toThrow()

    expect(repository.add).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password',
      role: 'customer'
    })
  })

  it('should throw ConflictError if email already exists', async () => {
    repository.findByEmail.mockResolvedValue({
      id: '1',
      name: 'Existing User',
      email: 'john@example.com',
      password: 'any',
      role: 'customer'
    })

    await expect(service.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    })).rejects.toThrow(ConflictError)
  })
})

