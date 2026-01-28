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

  it('should return a list of pets for the user', async () => {
    const pets = [
      { id: '1', user_id: 'user-id', name: 'Buddy', species: 'Dog', breed: 'Golden', birth_date: '2020-01-01' },
      { id: '2', user_id: 'user-id', name: 'Mittens', species: 'Cat', breed: 'Siamese', birth_date: '2019-01-01' }
    ]

    repository.findByUserId.mockResolvedValue(pets)

    const result = await service.execute({ userId: 'user-id' })

    expect(result).toEqual(pets)
    expect(repository.findByUserId).toHaveBeenCalledWith('user-id')
  })
})
