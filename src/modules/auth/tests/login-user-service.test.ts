import { mock, type MockProxy } from "vitest-mock-extended";
import { LoginUserService } from "../services/login-user-service";
import { UsersRepository } from "@/modules/users/repositories/users-repository";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import { UsersFaker } from "@/modules/users/fakers/users-faker";
import type { JwtProvider } from "../providers/jwt-provider";
import type { CryptoProvider } from "../providers/crypto-provider";

describe('Login User Service', () => {
  let repository: MockProxy<UsersRepository>
  let jwtProvider: MockProxy<JwtProvider>
  let cryptoProvider: MockProxy<CryptoProvider>
  let service: LoginUserService

  beforeEach(() => {
    repository = mock<UsersRepository>()
    jwtProvider = mock<JwtProvider>()
    cryptoProvider = mock<CryptoProvider>()
    service = new LoginUserService(repository, jwtProvider, cryptoProvider)
  })

  it('should login successfully with valid credentials', async () => {
    const user = UsersFaker.fake()

    repository.findByEmail.mockResolvedValue(user)
    cryptoProvider.compare.mockResolvedValue(true)
    jwtProvider.generateToken.mockReturnValue('any_token')

    const result = await service.execute({
      email: user.email,
      password: user.password
    })

    expect(result.token).toBe('any_token')
    expect(result.user.email).toBe(user.email)
  })

  it('should throw UnauthorizedError if user not found', async () => {
    repository.findByEmail.mockResolvedValue(undefined)

    await expect(service.execute({
      email: 'invalid_email@mail.com',
      password: 'any_password'
    })).rejects.toThrow(UnauthorizedError)
  })

  it('should throw UnauthorizedError if password does not match', async () => {
    const user = UsersFaker.fake()

    repository.findByEmail.mockResolvedValue(user)
    cryptoProvider.compare.mockResolvedValue(false)

    await expect(service.execute({
      email: user.email,
      password: 'wrong_password'
    })).rejects.toThrow(UnauthorizedError)
  })
})