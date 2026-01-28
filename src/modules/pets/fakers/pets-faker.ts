import type { Pet } from "../models/pet";
import { faker } from "@faker-js/faker";

export class PetsFaker {
  static fake(baseData?: Partial<Pet>): Pet {
    return {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      name: faker.animal.dog(),
      species: faker.helpers.arrayElement(['Dog', 'Cat', 'Bird']),
      breed: faker.animal.type(),
      age: faker.number.int({ min: 0, max: 20 }),
      weight: faker.number.float({ min: 1, max: 50, fractionDigits: 1 }),
      ...baseData
    }
  }

  static fakeMany(amount: number = 10, baseData?: Partial<Pet>): Pet[] {
    return Array.from({ length: amount }, () => this.fake(baseData))
  }
}
