import { mock, type MockProxy } from "vitest-mock-extended";
import { LoginUserService } from "../services/login-user-service";
import { UsersRepository } from "@/modules/users/repositories/users-repository";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import { UsersFaker } from "@/modules/users/fakers/users-faker";
import type { JwtProvider } from "../providers/jwt-provider";

describe('Login User Service', () => {
  let repository: MockProxy<UsersRepository>
  let jwtProvider: MockProxy<JwtProvider>
  let service: LoginUserService

  beforeEach(() => {
    repository = mock<UsersRepository>()
    jwtProvider = mock<JwtProvider>()
    service = new LoginUserService(repository, jwtProvider)
  })

  it('should login successfully with valid credentials', async () => {
    const user = UsersFaker.fake()

    repository.findByEmail.mockResolvedValue(user)

    await expect(service.execute({
      email: user.email,
      password: user.password
    })).resolves.not.toThrow()
  })

  it('should throw UnauthorizedError if user not found', async () => {
    repository.findByEmail.mockResolvedValue(undefined)

    await expect(service.execute({
      email: 'invalid_email@mail.com',
      password: 'any_password'
    })).rejects.toThrow(UnauthorizedError)
  })
})