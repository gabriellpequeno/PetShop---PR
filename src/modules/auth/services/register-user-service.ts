import { ConflictError } from "@/errors/conflict-error"
import { BadRequestError } from "@/errors/bad-request-error"
import type { UsersRepository } from "@/modules/users/repositories/users-repository"
import type { CryptoProvider } from "../providers/crypto-provider"

type Request = {
  name: string
  email: string
  password: string
}

export class RegisterUserService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly cryptoProvider: CryptoProvider
  ) {}

  async execute({ name, email, password }: Request) {
    if (!name || !email || !password) {
      throw new BadRequestError('Campos obrigatórios não preenchidos')
    }

    const userAlreadyExists = await this.usersRepository.findByEmail(email)

    if (userAlreadyExists) {
      throw new ConflictError('Email já cadastrado')
    }

    const hashedPassword = await this.cryptoProvider.generateHash(password)

    await this.usersRepository.add({
      name,
      email,
      password: hashedPassword,
      role: 'customer'
    })

    return {
      name,
      email,
      role: 'customer'
    }
  }
}

