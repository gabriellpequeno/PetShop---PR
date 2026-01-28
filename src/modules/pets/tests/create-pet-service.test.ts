import { mock, type MockProxy } from "vitest-mock-extended";
import { CreatePetService } from "../services/create-pet-service";
import { PetsRepository } from "../repositories/pets-repository";
import { AppError } from "@/errors/app-error";

describe('Create Pet Service', () => {
  let repository: MockProxy<PetsRepository>
  let service: CreatePetService

  beforeEach(() => {
    repository = mock<PetsRepository>()
    service = new CreatePetService(repository)
  })

  it('should create a pet successfully', async () => {
    await expect(service.execute({
      userId: 'user-id',
      name: 'Buddy',
      species: 'Dog',
      breed: 'Golden Retriever',
      birthDate: '2020-01-01'
    })).resolves.not.toThrow()

    expect(repository.add).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'user-id',
      name: 'Buddy',
      species: 'Dog',
      breed: 'Golden Retriever',
      birth_date: '2020-01-01'
    }))
  })

  it('should throw AppError if fields are missing', async () => {
    await expect(service.execute({
      userId: 'user-id',
      name: '',
      species: 'Dog',
      breed: 'Golden Retriever',
      birthDate: '2020-01-01'
    })).rejects.toThrow(AppError)
  })
})
