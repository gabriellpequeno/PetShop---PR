import type { User } from "../models/user";
import { faker } from "@faker-js/faker";

export class UsersFaker {
  static fake(baseData?: Partial<User>): User {
    return {
      id: faker.string.uuid(),
      name: faker.person.firstName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: faker.helpers.arrayElement(['admin', 'customer']),
      ...baseData
    }
  }

  static fakeMany(amount: number = 10, baseData?: Partial<User>): User[] {
    return Array.from({ length: amount }, () => this.fake(baseData))
  }
}
