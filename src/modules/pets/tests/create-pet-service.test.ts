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
      age: 2,
      weight: 30,
      size: 'M'
    })).resolves.not.toThrow()

    expect(repository.add).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user-id',
      name: 'Buddy',
      species: 'Dog',
      breed: 'Golden Retriever',
      age: 2,
      weight: 30,
      size: 'M'
    }))
  })

  it('should throw AppError if fields are missing', async () => {
    await expect(service.execute({
      userId: 'user-id',
      name: '',
      species: 'Dog',
      breed: 'Golden Retriever',
      age: 2,
      weight: 30,
      size: 'M'
    })).rejects.toThrow(AppError)
  })
})
