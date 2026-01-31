import { mock, type MockProxy } from "vitest-mock-extended";
import { ListPetsService } from "../services/list-pets-service";
import { PetsRepository } from "../repositories/pets-repository";

describe('List Pets Service', () => {
  let repository: MockProxy<PetsRepository>
  let service: ListPetsService

  beforeEach(() => {
    repository = mock<PetsRepository>()
    service = new ListPetsService(repository)
  })

  it('should return a list of pets for the user (customer)', async () => {
    const pets = [
      { id: '1', userId: 'user-id', name: 'Buddy', species: 'Dog', breed: 'Golden', age: 4, weight: 30, size: 'G' as const },
      { id: '2', userId: 'user-id', name: 'Mittens', species: 'Cat', breed: 'Siamese', age: 2, weight: 5, size: 'P' as const }
    ]

    repository.findByUserId.mockResolvedValue(pets)

    const result = await service.execute({ userId: 'user-id', role: 'customer' })

    expect(result).toEqual(pets)
    expect(repository.findByUserId).toHaveBeenCalledWith('user-id')
  })

  it('should return all pets for admin', async () => {
    const pets = [
      { id: '1', userId: 'user-1', name: 'Buddy', species: 'Dog', breed: 'Golden', age: 4, weight: 30, size: 'G' as const },
      { id: '3', userId: 'user-2', name: 'Rex', species: 'Dog', breed: 'Labrador', age: 5, weight: 35, size: 'G' as const }
    ]

    repository.findAll.mockResolvedValue(pets)

    const result = await service.execute({ userId: 'admin-id', role: 'admin' })

    expect(result).toEqual(pets)
    expect(repository.findAll).toHaveBeenCalled()
  })
})
