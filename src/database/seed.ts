import { db } from "./db"
import { UsersFaker } from "../modules/users/fakers/users-faker";
import { PetsFaker } from "../modules/pets/fakers/pets-faker";
import { CryptoProvider } from "../modules/auth/providers/crypto-provider";
import { randomInt } from "crypto";

async function seed() {
  console.log("Seeding database...")

  await db.exec("DELETE FROM pets")
  await db.exec("DELETE FROM users")

  const cryptoProvider = new CryptoProvider()
  const defaultPassword = "123456"

  const targetUserId = "5655bac0-31e7-4a5e-8c80-5b1e626eb394"
  
  const fixedUsers = [
    UsersFaker.fake({
      id: targetUserId,
      name: "User With Pets",
      email: "user@gmail.com",
      password: defaultPassword,
      role: "customer"
    }),
    UsersFaker.fake({
      name: "Admin User",
      email: "admin@gmail.com",
      password: defaultPassword,
      role: "admin"
    })
  ]

  const randomUsers = UsersFaker.fakeMany(5)
  const allUsers = [...fixedUsers, ...randomUsers]

  for (const user of allUsers) {
    const hashedPassword = await cryptoProvider.generateHash(user.password)

    await db.run(
      `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`,
      [user.id, user.name, user.email, hashedPassword, user.role]
    )
  }
  console.log(`Created ${allUsers.length} users.`)

  const targetUserPets = PetsFaker.fakeMany(20, { userId: targetUserId })
  let allPets = [...targetUserPets]

  for (const user of randomUsers) {
    if (Math.random() > 0.3) {
      const numPets = randomInt(1, 4)
      const userPets = PetsFaker.fakeMany(numPets, { userId: user.id })
      allPets = [...allPets, ...userPets]
    }
  }
  
  for (const pet of allPets) {
    await db.run(
      `INSERT INTO pets (id, userId, name, species, breed, age, weight) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [pet.id, pet.userId, pet.name, pet.species, pet.breed, pet.age, pet.weight]
    )
  }
  console.log(`Created ${targetUserPets.length} pets for target user ${targetUserId}.`)
  console.log(`Created ${allPets.length - targetUserPets.length} random pets for others.`)
}

seed()
  .then(() => {
    console.log("Seeding completed! 🌱")
  })
  .catch((error) => {
    console.error('Error seeding database:', error)
  })